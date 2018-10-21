import {Device} from '../device.js';
import {IpAddress} from '../ip-address.js';
import {IpAddressSerializer} from './address-serializer.js';
import {Serializer} from './serializer.js';

/**
 * @extends {Serializer<Device>}
 */
export class DeviceSerializer extends Serializer {

    /**
     * @param {Serializer<IpAddress>} addressSerializer
     */
    constructor(addressSerializer) {
        super();
        this.addressSerializer_ = addressSerializer;
    }

    /**
     * @param {Device} obj
     * @return {any}
     * @protected
     */
    serializeBlob_(obj) {
        return {
            name: obj.name,
            group: obj.group,
            address: this.addressSerializer_.serializeBlob(obj.address),
            traffic: obj.traffic,
            packets: obj.packets
        };
    }

    /**
     * @param {any} blob
     * @return {Device}
     * @protected
     */
    deserializeBlob_(blob) {
        const obj = new Device();
        obj.name = blob.name;
        obj.group = blob.group;
        obj.address = this.addressSerializer_.deserializeBlob(blob.address);
        obj.traffic = blob.traffic;
        obj.packets = blob.packets;
        return obj;
    }
}

/**
 * @constant {Serializer<Device>}
 */
DeviceSerializer.DEFAULT = new DeviceSerializer(IpAddressSerializer.DEFAULT);
