import {DeviceGroup} from '../../domain/device.js';
import {formatBytes, formatInteger} from '../../util/format.js';
import {Table, TableRow} from '../ui/table.js';

/**
 * @extends {Table<DeviceGroup>}
 */
export class DeviceGroupTable extends Table {

    /**
     * @param {(function(root: !HTMLTableRowElement, data: DeviceGroup): !TableRow<DeviceGroup>)=} rowFactory
     * @param  {...any} args
     */
    init(rowFactory = (root, data) => new DeviceGroupTableRow(root, data), ...args) {
        super.init(rowFactory, ...args);
    }

    /**
     * @param {!DeviceGroup} data
     * @return {!TableRow<DeviceGroup>}
     */
    appendRow(data) {
        const row = super.appendRow(data);
        this.updateTotals();
        return row;
    }

    updateTotals() {
        let totalPackets = 0;
        let totalTraffic = 0;
        this.rows.forEach(row => {
            row.data.devices.forEach(device => {
                totalPackets += device.packets;
                totalTraffic += device.traffic;
            });
        });

        const S = DeviceGroupTable.Selector;
        this.root.querySelectorAll(S.TOTAL_PACKETS_CELL)
                .forEach(elem => elem.textContent = formatInteger(totalPackets));
        this.root.querySelectorAll(S.TOTAL_TRAFFIC_CELL)
                .forEach(elem => elem.textContent = formatBytes(totalTraffic));
    }
}

/**
 * @enum {string}
 * @readonly
 * @private
 */
DeviceGroupTable.Selector = {
    TOTAL_PACKETS_CELL: '.foot.row .packets.cell',
    TOTAL_TRAFFIC_CELL: '.foot.row .traffic.cell'
};

/**
 * @extends {TableRow<DeviceGroup>}
 */
export class DeviceGroupTableRow extends TableRow {

    initDom() {
        super.initDom();

        const S = DeviceGroupTableRow.Selector;
        this.render({
            [S.NAME_CELL]: (elem, data) => elem.textContent = data.name || '',
            [S.PACKETS_CELL]: (elem, data) =>
                    elem.textContent = formatInteger(data.devices.map(it => it.packets).reduce((a, b) => a + b, 0)),
            [S.TRAFFIC_CELL]: (elem, data) =>
                    elem.textContent = formatBytes(data.devices.map(it => it.traffic).reduce((a, b) => a + b, 0))
        });
    }
}

/**
 * @enum {string}
 * @readonly
 * @private
 */
DeviceGroupTableRow.Selector = {
    NAME_CELL: '.cell.name',
    PACKETS_CELL: '.cell.packets',
    TRAFFIC_CELL: '.cell.traffic'
};
