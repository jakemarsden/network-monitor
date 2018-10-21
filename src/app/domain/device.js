import {IpAddress} from './ip-address.js';

export class Device {

    constructor() {
        /**
         * @type {string} name
         */
        this.name = null;
        /**
         * @type {string} group
         */
        this.group = null;
        /**
         * @type {IpAddress}
         */
        this.address = null;
        /**
         * In bytes
         * @type {number}
         */
        this.traffic = 0;
        /**
         * @type {number}
         */
        this.packets = 0;
    }
}

export class DeviceGroup {

    constructor() {
        /**
         * @type {string}
         */
        this.name = null;
        /**
         * @type {Array<Device>}
         */
        this.devices = null;
    }
}
