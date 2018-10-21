import {DeviceGroup} from '../../domain/device.js';
import {UiComponent} from '../ui/ui.js';
import {InterfaceStatTable, InterfaceStatsTableRow} from './interface-stats-table.js';

export class DeviceGroupUi extends UiComponent {

    /**
     * @param {!DeviceGroup} data
     * @param {...any} args
     */
    init(data, ...args) {
        super.init(...args);
        /**
         * @constant {!DeviceGroup}
         */
        this.data = data;
    }

    initDom() {
        super.initDom();

        const S = DeviceGroupUi.Selector;
        this.root.querySelector(S.NAME).textContent = this.data.name;
        /**
         * @constant {InterfaceStatTable}
         * @private
         */
        this.deviceTable_ = new InterfaceStatTable(this.root.querySelector(S.DEVICE_TABLE));

        this.populateDeviceTable();
    }

    destroy() {
        this.deviceTable_.destroy();
        super.destroy();
    }

    populateDeviceTable() {
        const table = this.deviceTable_;
        this.data.devices.forEach(device => table.appendRow(device));
    }
}

/**
 * @constant {Object.<string, string>}
 * @private
 */
DeviceGroupUi.Selector = {
    NAME: '.name',
    DEVICE_TABLE: '.device-stats.table'
};

export class DeviceGroupsUi extends UiComponent {

    /**
     * @param {function(root: !HTMLElement, data: DeviceGroup): !DeviceGroupUi} groupFactory
     * @param  {...any} args
     */
    init(groupFactory = (root, data) => new DeviceGroupUi(root, data), ...args) {
        super.init(...args);
        /**
         * @constant {Array<DeviceGroupUi>}
         */
        this.groups = [];
        /**
         * @constant {function(root: !HTMLElement, data: DeviceGroup): !DeviceGroupUi}
         * @private
         */
        this.groupFactory_ = groupFactory;
    }

    initDom() {
        super.initDom();
        /**
         * @constant {!HTMLTemplateElement}
         * @private
         */
        this.groupTemplate_ = this.root.querySelector(DeviceGroupsUi.Selector.GROUP_TEMPLATE);
    }

    destroy() {
        this.groups.forEach(group => group.destroy());
        this.groups.length = 0;
        super.destroy();
    }

    /**
     * @param {!DeviceGroup} data
     * @return {!DeviceGroupUi}
     */
    appendGroup(data) {
        const S = DeviceGroupsUi.Selector;
        const groupFrag = document.importNode(this.groupTemplate_.content, true);
        const group = this.groupFactory_(groupFrag.querySelector(S.GROUP_TEMPLATE_ROOT), data);
        this.groups.push(group);
        this.root.appendChild(group.root);
        return group;
    }

    clearGroups() {
        const root = this.root;
        this.groups.forEach(group => root.removeChild(group.root));
        this.groups.forEach(group => group.destroy());
        this.groups.length = 0;
    }
}

/**
 * @constant {Object.<string, string>}
 * @private
 */
DeviceGroupsUi.Selector = {
    GROUP_TEMPLATE: '.group-template',
    GROUP_TEMPLATE_ROOT: '.group'
};
