import {Address4, Address6} from 'ip-address';

/**
 * @param {(Address4|Address6|string)} addr
 * @return {(Address4|Address6)}
 */
export function parseIpAddress(addr) {
    if (addr instanceof Address4 || addr instanceof Address6) {
        if(addr.isValid()) {
            return addr;
        }
        throw new TypeError(`Invalid IP address: ${addr.address}`);
    }

    const v6 = new Address6(addr);
    if (v6.isValid()) {
        return v6;
    }

    const v4 = new Address4(addr);
    if (v4.isValid()) {
        return v4;
    }

    throw new TypeError(`Invalid IP address: '${addr}'`);
}
