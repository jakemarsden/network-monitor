import {Address4, Address6} from 'ip-address';

export class IpAddress {

    /**
     * @param {number} int
     * @param {IpAddress.Type=} type
     * @return {IpAddress}
     */
    static fromInteger(int, type = undefined) {
        if (type === undefined) {
            type = (int > 0xffffffff) ? IpAddress.Type.IPv4 : IpAddress.Type.IPv6;
        }
        switch (type) {
            case IpAddress.Type.IPv4:
                return IpAddress.create_(Address4.fromInteger(int), int);
            default:
                throw new TypeError(`Unsupported IP address type: ${type}`);
        }
    }

    /**
     * @param {string} str
     * @param {IpAddress.Type=} type
     * @return {IpAddress}
     */
    static fromString(str, type = undefined) {
        if (type === undefined) {
            // Extremelly rough test to see if it looks like an IPv4 address. We can let the library handle the finer
            // details of validation, but for now we just want to know whether it's IPv4 or IPv6
            type = /^\d+(\.\d+){3}/.test(str) ? IpAddress.Type.IPv4 : IpAddress.Type.IPv6;
        }
        switch (type) {
            case IpAddress.Type.IPv4:
                return IpAddress.create_(new Address4(str), str);
            case IpAddress.Type.IPv6:
                return IpAddress.create_(new Address6(str), str);
            default:
                throw new TypeError(`Unsupported IP address type: ${type}`);
        }
    }

    /**
     * @param {!(Address4|Address6)} addr
     * @param {any} raw
     * @return {IpAddress}
     * @private
     */
    static create_(addr, raw) {
        if (!addr.isValid()) {
            throw new TypeError(`Invalid IP address: '${raw}'`);
        }
        return new IpAddress(addr);
    }

    /**
     * @param {!(Address4|Address6)} addr
     * @private
     */
    constructor(addr) {
        /**
         * @constant {!(Address4|Address6)}
         * @private
         */
        this.addr_ = addr;
    }

    /**
     * @return {IpAddress.Type}
     */
    get type() {
        return this.addr_.v4 ? IpAddress.Type.IPv4 : IpAddress.Type.IPv6;
    }

    /**
     * @return {number}
     */
    get prefixLength() {
        return this.addr_.subnetMask;
    }

    /**
     * @param {IpAddress} subnet
     * @return {boolean}
     */
    isInSubnet(subnet) {
        return this.addr_.isInSubnet(subnet.addr_);
    }

    /**
     * @param  {Array<IpAddress>} subnets
     * @return {boolean}
     */
    isInAnySubnet(subnets) {
        const addr = this.addr_;
        return subnets.some(subnet => addr.isInSubnet(subnet.addr_));
    }

    /**
     * @param {IpAddress} other
     * @return {boolean}
     */
    equals(other) {
        if (other == null) {
            return false;
        }
        if (other.type !== this.type) {
            return false;
        }
        return other.isInSubnet(this) &&
                this.isInSubnet(other);
    }

    /**
     * @return {string}
     */
    toString() {
        return this.addr_.correctForm();
    }
}

/**
 * @enum {number}
 * @readonly
 */
IpAddress.Type = {
    IPv4: 4,
    IPv6: 6
};
