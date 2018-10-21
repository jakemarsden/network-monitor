import {Address4, Address6} from 'ip-address';

export class InterfaceStat {

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
         * @type {(Address4|Address6)}
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

    /**
     * @param {(Address4|Address6)} addr
     * @return {boolean}
     */
    hasAddress(addr) {
        return this.address.correctForm() === addr.correctForm();
    }
}
