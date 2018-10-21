import {DeviceGroup, InterfaceStat} from '../../domain/device.js';
import {InterfaceStatSerializer} from '../../domain/serialize/device-serializer.js';
import {ajax} from '../../util/ajax.js';
import {Page} from '../ui/page.js';
import {DeviceGroupsUi} from './device-group-ui.js';
import './index.scss';

class MainPage extends Page {

    /**
     * @param {...any} args
     */
    init(...args) {
        super.init(...args);
        /**
         * @constant {Serializer<InterfaceStat>}
         * @private
         */
        this.interfaceStatSerializer_ = InterfaceStatSerializer.DEFAULT;
        /**
         * @constant {Promise<Array<InterfaceStat>>}
         * @private
         */
        this.deviceGroups_ = this.fetchDeviceGroups_();
    }

    initDom() {
        super.initDom();
        /**
         * @constant {DeviceGroupsUi}
         * @private
         */
        this.deviceGroupsUi_ = new DeviceGroupsUi(this.root.querySelector(MainPage.Selector.DEVICE_GROUPS));

        this.populateDeviceGroups();
    }

    destroy() {
        this.deviceGroupsUi_.destroy();
        super.destroy();
    }

    populateDeviceGroups() {
        const groupsUi = this.deviceGroupsUi_;
        const groups = this.deviceGroups_;
        groupsUi.clearGroups();
        groups.then(groups => {
            groups.forEach(group => groupsUi.appendGroup(group));
            return groups;
        });
    }

    /**
     * @return {Promise<Array<DeviceGroup>>}
     * @private
     */
    fetchDeviceGroups_() {
        const opts = {
            headers: { 'Accept': 'application/json' },
            method: 'GET',
            url: '/api/interface-stat',
        };
        return ajax(opts)
                .then(response => this.interfaceStatSerializer_.deserializeJson(response.text))
                .then(devices => this.aggregateDeviceGroups_(devices));
    }

    /**
     * @param {Array<InterfaceStat>} devices
     * @return {Array<DeviceGroup>}
     * @private
     */
    aggregateDeviceGroups_(devices) {
        /**
         * @constant {Map<string, DeviceGroup>}
         */
        const groups = new Map();
        devices.forEach(device => {
            let group = groups.get(device.group);
            if (group === undefined) {
                group = new DeviceGroup();
                group.name = device.group;
                group.devices = [];
                groups.set(group.name, group);
            }
            group.devices.push(device);
        });
        return Array.from(groups.values());
    }
}

/**
 * @constant {Object.<string, string>}
 * @private
 */
MainPage.Selector = {
    DEVICE_GROUPS: 'body.netmon .device-groups'
};

new MainPage(window);
