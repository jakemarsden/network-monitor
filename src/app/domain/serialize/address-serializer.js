import {IpAddress} from '../ip-address.js';
import {Serializer} from './serializer.js';

/**
 * @extends {Serializer<IpAddress>}
 */
export class IpAddressSerializer extends Serializer {

    /**
     * @param {IpAddress} obj
     * @return {any}
     * @protected
     */
    serializeBlob_(obj) {
        return obj.toString();
    }

    /**
     * @param {any} blob
     * @return {IpAddress}
     * @protected
     */
    deserializeBlob_(blob) {
        return IpAddress.fromString(blob);
    }
}

/**
 * @constant {Serializer<IpAddress>}
 */
IpAddressSerializer.DEFAULT = new IpAddressSerializer();
