import {Address4, Address6} from 'ip-address';
import {Serializer} from './serializer.js';

/**
 * @extends {Serializer<(Address4|Address6)>}
 */
export class AddressSerializer extends Serializer {

    /**
     * @param {(Address4|Address6)} obj
     * @return {any}
     * @protected
     */
    serializeBlob_(obj) {
        return {
            address: obj.address,
            v4: obj.v4
        };
    }

    /**
     * @param {any} blob
     * @return {(Address4|Address6)}
     * @protected
     */
    deserializeBlob_(blob) {
        const address = blob.address;
        return blob.v4 ? new Address4(address) : new Address6(address);
    }
}

/**
 * @constant {Serializer<(Address4|Address6)>}
 */
AddressSerializer.DEFAULT = new AddressSerializer();
