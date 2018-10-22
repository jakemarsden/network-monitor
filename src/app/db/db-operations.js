import {Interval} from 'luxon';
import {Flow} from '../domain/flow.js';
import {IpAddress} from '../domain/ip-address.js';
import {DbFactory} from './db-factory.js';

export class DbOperations {

    /**
     * @param {DbFactory} db
     */
    constructor(db) {
        /**
         * @constant {DbFactory}
         * @private
         */
        this.db_ = db;
    }

    /**
     * @param {Interval} Interval
     * @return {Promise<Array<Ipv4Flow>>}
     */
    getAggregateIpv4Flows(interval) {
        return this.getAggregateFlows_('flowsv4', interval)
                .then(rows => rows.map(row => this.parseIpv4Flow_(row)));
    }

    /**
     * @param {Interval} Interval
     * @return {Promise<Array<Flow>>}
     */
    getAggregateIpv6Flows(interval) {
        return this.getAggregateFlows_('flowsv6', interval)
                .then(rows => rows.map(row => this.parseIpv6Flow_(row)));
    }

    /**
     * @param {string} table
     * @param {Interval} Interval
     * @return {Promise<Array<T>>}
     * @template T
     * @private
     */
    getAggregateFlows_(table, interval) {
        // ntopng stores timestamps as Epoch seconds in the local zone (ie. not UTC for some reason). Here we assume
        // this machine is in the same zone as the DB
        const startEpochSeconds = interval.start.toLocal().toMillis() / 1000.00;
        const endEpochSeconds = interval.end.toLocal().toMillis() / 1000.00;

        const query = this.db_.get()
                .select({
                    ip_src_addr: 'f.ip_src_addr',
                    ip_dst_addr: 'f.ip_dst_addr'
                })
                .sum({ in_bytes: 'f.in_bytes' })
                .sum({ out_bytes: 'f.out_bytes' })
                .sum({ packets: 'f.packets' })
                .groupBy('f.ip_src_addr', 'f.ip_dst_addr')
                .from(db => db
                        .select('ip_src_addr', 'ip_dst_addr', 'in_bytes', 'out_bytes', 'packets')
                        .where('first_switched', '>=', startEpochSeconds)
                        .andWhere('last_switched', '<', endEpochSeconds)
                        .table(table)
                        .as('f'));
        return query
                .catch(err => console.error(`Error executing query: ${query}\n${err && err.stack || err}`));
    }

    /**
     * @param {Object} row
     * @param {number} row.ip_src_addr
     * @param {number} row.ip_dst_addr
     * @param {number} row.in_bytes
     * @param {number} row.out_bytes
     * @param {number} row.packets
     * @return {Flow}
     * @private
     */
    parseIpv4Flow_(row) {
        const flow = new Flow();
        flow.source = IpAddress.fromInteger(row.ip_src_addr, IpAddress.Type.IPv4);
        flow.destination = IpAddress.fromInteger(row.ip_dst_addr, IpAddress.Type.IPv4);
        flow.bytesIn = row.in_bytes;
        flow.bytesOut = row.out_bytes;
        flow.packets = row.packets;
        return flow;
    }

    /**
     * @param {Object} row
     * @param {string} row.ip_src_addr
     * @param {string} row.ip_dst_addr
     * @param {number} row.in_bytes
     * @param {number} row.out_bytes
     * @param {number} row.packets
     * @return {Flow}
     * @private
     */
    parseIpv6Flow_(row) {
        const flow = new Flow();
        flow.source = IpAddress.fromString(row.ip_src_addr, IpAddress.Type.IPv6);
        flow.destination = IpAddress.fromString(row.ip_dst_addr, IpAddress.Type.IPv6);
        flow.bytesIn = row.in_bytes;
        flow.bytesOut = row.out_bytes;
        flow.packets = row.packets;
        return flow;
    }
}
