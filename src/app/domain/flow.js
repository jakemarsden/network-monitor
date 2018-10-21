import {IpAddress} from './ip-address.js';

export class Flow {

    constructor() {
        /**
         * @type {IpAddress}
         */
        this.source = null;
        /**
         * @type {IpAddress}
         */
        this.destination = null;
        /**
         * @type {number}
         */
        this.bytesIn = null;
        /**
         * @type {number}
         */
        this.bytesOut = null;
        /**
         * @type {number}
         */
        this.packets = null;
    }
}
