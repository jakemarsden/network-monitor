import {Address4, Address6} from 'ip-address';
import {DbOperations} from '../db/db-operations.js';
import {InterfaceStat} from '../domain/device.js';
import {Flow} from '../domain/flow.js';
import {parseIpAddress} from '../util/parse.js';

export class Service {

    /**
     * @param {DbOperations} db
     * @param {Object.<string, string>} deviceGroups
     * @param {Object.<string, string>} deviceLabels
     */
    constructor(db, deviceGroups, deviceLabels) {
        /**
         * @constant {DbOperations}
         * @private
         */
        this.db_ = db;
        /**
         * @constant {Object.<string, string>}
         * @private
         */
        this.deviceGroups_ = deviceGroups;
        /**
         * @constant {Object.<string, string>}
         * @private
         */
        this.deviceLabels_ = deviceLabels;
    }

    /**
     * @param {Array<(Address4|Address6)>} subnets
     * @return {Promise<Array<InterfaceStat>>}
     */
    aggregateInterfaceStats(subnets) {
        const promise4 = this.db_.getAggregateIpv4Flows();
        const promise6 = this.db_.getAggregateIpv6Flows();
        return Promise.all([promise4, promise6])
                .then(([flows4, flows6]) => [...flows4, ...flows6])
                .then(flows => this.aggregateInterfaceStats_(flows, subnets));
    }

    /**
     * @param {Array<Flow>} flows
     * @param {Array<(Address4|Address6)>} subnets
     * @return {Array<InterfaceStat>}
     * @private
     */
    aggregateInterfaceStats_(flows, subnets) {
        /**
         * @constant {Array<InterfaceStat>}
         */
        const interfaces = [];

        const isInSubnet = addr => subnets.some(subnet => addr.isInSubnet(subnet));
        flows
                .filter(flow => isInSubnet(flow.sourceAddress))
                .forEach(flow => {
                    const int = this.getOrPutInterfaceIfAbsent_(flow.sourceAddress, interfaces);
                    int.traffic += flow.bytesIn;
                    int.traffic += flow.bytesOut;
                    int.packets += flow.packets;
                });
        flows
                .filter(flow => isInSubnet(flow.destinationAddress))
                .forEach(flow => {
                    const int = this.getOrPutInterfaceIfAbsent_(flow.destinationAddress, interfaces);
                    int.traffic += flow.bytesIn;
                    int.traffic += flow.bytesOut;
                    int.packets += flow.packets;
                });
        return interfaces;
    }

    /**
     * @param {(Address4|Address6)} address
     * @param {Array<InterfaceStat>} interfaces
     * @return {InterfaceStat}
     * @private
     */
    getOrPutInterfaceIfAbsent_(address, interfaces) {
        let int = interfaces.find(int => int.hasAddress(address));
        if (int === undefined) {
            int = new InterfaceStat();
            int.name = this.findAddressLabel_(address) || null;
            int.group = this.findAddressGroup_(address) || null;
            int.address = address;
            interfaces.push(int);
        }
        return int;
    }

    /**
     * @param {(Address4|Address6)} address
     * @return {(string|undefined)}
     */
    findAddressGroup_(address) {
        let group;
        for (const [groupSubnet, groupName] of Object.entries(this.deviceGroups_)) {
            if (address.isInSubnet(parseIpAddress(groupSubnet))) {
                group = groupName;
            }
        }
        return group;
    }

    /**
     * @param {(Address4|Address6)} address
     * @return {(string|undefined)}
     */
    findAddressLabel_(address) {
        let label;
        for (const [deviceAddress, deviceLabel] of Object.entries(this.deviceLabels_)) {
            if (address.isInSubnet(parseIpAddress(deviceAddress))) {
                label = deviceLabel;
            }
        }
        return label;
    }
}
