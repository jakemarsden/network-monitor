import {Address4, Address6} from 'ip-address';
import {InterfaceStat} from '../device.js';
import {AddressSerializer} from './address-serializer.js';
import {Serializer} from './serializer.js';

/**
 * @extends {Serializer<InterfaceStat>}
 */
export class InterfaceStatSerializer extends Serializer {

    /**
     * @param {Serializer<(Address4|Address6)>} addressSerializer
     */
    constructor(addressSerializer) {
        super();
        this.addressSerializer_ = addressSerializer;
    }

    /**
     * @param {InterfaceStat} obj
     * @return {any}
     * @protected
     */
    serializeBlob_(obj) {
        return {
            address: this.addressSerializer_.serializeBlob(obj.address),
            traffic: obj.traffic,
            packets: obj.packets
        };
    }

    /**
     * @param {any} blob
     * @return {InterfaceStat}
     * @protected
     */
    deserializeBlob_(blob) {
        const obj = new InterfaceStat();
        obj.address = this.addressSerializer_.deserializeBlob(blob.address);
        obj.traffic = blob.traffic;
        obj.packets = blob.packets;
        return obj;
    }
}

/**
 * @constant {Serializer<InterfaceStat>}
 */
InterfaceStatSerializer.DEFAULT = new InterfaceStatSerializer(AddressSerializer.DEFAULT);
