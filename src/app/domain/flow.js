import {Address4, Address6} from 'ip-address';

export class Flow {

    constructor() {
        /**
         * @type {(Address4|Address6)}
         */
        this.sourceAddress = null;
        /**
         * @type {(Address4|Address6)}
         */
        this.destinationAddress = null;
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
