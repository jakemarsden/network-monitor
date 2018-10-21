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
     * @return {Promise<Array<Ipv4Flow>>}
     */
    getAggregateIpv4Flows() {
        return this.getAggregateFlows_('flowsv4')
                .then(rows => rows.map(row => this.parseIpv4Flow_(row)));
    }

    /**
     * @return {Promise<Array<Flow>>}
     */
    getAggregateIpv6Flows() {
        return this.getAggregateFlows_('flowsv6')
                .then(rows => rows.map(row => this.parseIpv6Flow_(row)));
    }

    /**
     * @param {string} table
     * @return {Promise<Array<T>>}
     * @template T
     * @private
     */
    getAggregateFlows_(table) {
        const query = this.db_.get()
                .select('ip_src_addr')
                .select('ip_dst_addr')
                .sum({ 'in_bytes': 'in_bytes' })
                .sum({ 'out_bytes': 'out_bytes' })
                .sum({ 'packets': 'packets' })
                .table(table)
                .groupBy('ip_src_addr', 'ip_dst_addr');
        return query
                .catch(err => console.error(`Error executing query '${query}': ${err}`));
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
