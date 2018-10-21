import {DbOperations} from '../db/db-operations.js';
import {Device} from '../domain/device.js';
import {Flow} from '../domain/flow.js';
import {IpAddress} from '../domain/ip-address.js';

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
     * @param {Array<IpAddress>} subnets
     * @return {Promise<Array<Device>>}
     */
    aggregateDeviceStats(subnets) {
        const promise4 = this.db_.getAggregateIpv4Flows();
        const promise6 = this.db_.getAggregateIpv6Flows();
        return Promise.all([promise4, promise6])
                .then(([flows4, flows6]) => [...flows4, ...flows6])
                .then(flows => this.aggregateDeviceStats_(flows, subnets));
    }

    /**
     * @param {Array<Flow>} flows
     * @param {Array<IpAddress>} subnets
     * @return {Array<Device>}
     * @private
     */
    aggregateDeviceStats_(flows, subnets) {
        /**
         * @constant {Array<Device>}
         */
        const devices = [];
        flows
                .filter(flow => flow.source.isInAnySubnet(subnets))
                .forEach(flow => {
                    const device = this.getOrPutDeviceIfAbsent_(flow.source, devices);
                    device.traffic += flow.bytesIn;
                    device.traffic += flow.bytesOut;
                    device.packets += flow.packets;
                });
        flows
                .filter(flow => flow.destination.isInAnySubnet(subnets))
                .forEach(flow => {
                    const device = this.getOrPutDeviceIfAbsent_(flow.destination, devices);
                    device.traffic += flow.bytesIn;
                    device.traffic += flow.bytesOut;
                    device.packets += flow.packets;
                });
        return devices;
    }

    /**
     * @param {IpAddress} address
     * @param {Array<Device>} devices
     * @return {Device}
     * @private
     */
    getOrPutDeviceIfAbsent_(address, devices) {
        let device = devices.find(device => device.address.equals(address));
        if (device === undefined) {
            device = new Device();
            device.name = this.findAddressLabel_(address) || null;
            device.group = this.findAddressGroup_(address) || null;
            device.address = address;
            devices.push(device);
        }
        return device;
    }

    /**
     * @param {IpAddress} address
     * @return {(string|undefined)}
     */
    findAddressGroup_(address) {
        let group;
        for (const [groupSubnet, groupName] of Object.entries(this.deviceGroups_)) {
            if (address.isInSubnet(IpAddress.fromString(groupSubnet))) {
                group = groupName;
            }
        }
        return group;
    }

    /**
     * @param {IpAddress} address
     * @return {(string|undefined)}
     */
    findAddressLabel_(address) {
        let label;
        for (const [deviceAddress, deviceLabel] of Object.entries(this.deviceLabels_)) {
            if (address.isInSubnet(IpAddress.fromString(deviceAddress))) {
                label = deviceLabel;
            }
        }
        return label;
    }
}
