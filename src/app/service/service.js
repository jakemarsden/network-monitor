import {Address4, Address6} from 'ip-address';
import {DbOperations} from '../db/db-operations.js';
import {InterfaceStat} from '../domain/device.js';
import {Flow} from '../domain/flow.js';

export class Service {

    /**
     * @param {DbOperations} db
     */
    constructor(db) {
        /**
         * @constant {DbOperations}
         * @private
         */
        this.db_ = db;
    }

    /**
     * @param {Array<(Address4|Address6)>} subnets
     * @return {Promise<Array<InterfaceStat>>}
     */
    aggregateInterfaceStats(subnets) {
        console.debug(`${this.constructor.name}#aggregateInterfaceStats: subnets=[${subnets.map(it => it.address).join(', ')}]`);
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
                    const int = Service.getOrPutInterfaceIfAbsent_(flow.sourceAddress, interfaces);
                    int.traffic += flow.bytesIn;
                    int.traffic += flow.bytesOut;
                    int.packets += flow.packets;
                });
        flows
                .filter(flow => isInSubnet(flow.destinationAddress))
                .forEach(flow => {
                    const int = Service.getOrPutInterfaceIfAbsent_(flow.destinationAddress, interfaces);
                    int.traffic += flow.bytesOut;
                    int.traffic += flow.bytesIn;
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
    static getOrPutInterfaceIfAbsent_(address, interfaces) {
        let int = interfaces.find(int => int.hasAddress(address));
        if (int === undefined) {
            int = new InterfaceStat();
            int.address = address;
            interfaces.push(int);
        }
        return int;
    }
}
