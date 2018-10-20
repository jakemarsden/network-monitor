import {InterfaceStat} from '../device.js';
import {AddressSerializer} from './address-serializer.js';
import {Serializer} from './serializer.js';

/**
 * @extends {Serializer<InterfaceStat>}
 */
export class InterfaceStatSerializer extends Serializer {

    /**
     * @param {InterfaceStat} obj
     * @return {any}
     * @protected
     */
    serializeBlob_(obj) {
        return {
            address: AddressSerializer.DEFAULT.serializeBlob(obj.address),
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
        obj.address = AddressSerializer.DEFAULT.deserializeBlob(blob.address);
        obj.traffic = blob.traffic;
        obj.packets = blob.packets;
        return obj;
    }
}

/**
 * @constant {InterfaceStatSerializer}
 */
InterfaceStatSerializer.DEFAULT = new InterfaceStatSerializer();
