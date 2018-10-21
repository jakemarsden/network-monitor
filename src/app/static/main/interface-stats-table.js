import {InterfaceStat} from '../../domain/device.js';
import {formatBytes, formatInteger} from '../../util/format.js';
import {Table, TableRow} from '../ui/table.js';

/**
 * @extends {Table<InterfaceStat>}
 */
export class InterfaceStatTable extends Table {

    /**
     * @param {(function(root: !HTMLTableRowElement, data: InterfaceStat): !TableRow<InterfaceStat>)=} rowFactory
     * @param  {...any} args
     */
    init(rowFactory = (root, data) => new InterfaceStatsTableRow(root, data), ...args) {
        super.init(rowFactory, ...args);
    }

    /**
     * @param {!InterfaceStat} data
     * @return {!TableRow<InterfaceStat>}
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
            totalPackets += row.data.packets;
            totalTraffic += row.data.traffic;
        });

        const S = InterfaceStatTable.Selector;
        this.root.querySelectorAll(S.TOTAL_PACKETS_CELL)
                .forEach(elem => elem.textContent = formatInteger(totalPackets));
        this.root.querySelectorAll(S.TOTAL_TRAFFIC_CELL)
                .forEach(elem => elem.textContent = formatBytes(totalTraffic));
    }
}

/**
 * @constant {Object.<string, string>}
 * @private
 */
InterfaceStatTable.Selector = {
    TOTAL_PACKETS_CELL: '.foot.row .packets.cell',
    TOTAL_TRAFFIC_CELL: '.foot.row .traffic.cell'
};

/**
 * @extends {TableRow<InterfaceStat>}
 */
export class InterfaceStatsTableRow extends TableRow {

    initDom() {
        super.initDom();

        const S = InterfaceStatsTableRow.Selector;
        this.render({
            [S.ADDRESS_CELL]: (elem, data) => elem.textContent = data.address.correctForm(),
            [S.GROUP_CELL]: (elem, data) => elem.textContent = data.group || '',
            [S.NAME_CELL]: (elem, data) => elem.textContent = data.name || '',
            [S.PACKETS_CELL]: (elem, data) => elem.textContent = formatInteger(data.packets),
            [S.TRAFFIC_CELL]: (elem, data) => elem.textContent = formatBytes(data.traffic)
        });
    }
}

/**
 * @constant {Object.<string, string>}
 * @private
 */
InterfaceStatsTableRow.Selector = {
    ADDRESS_CELL: '.cell.address',
    GROUP_CELL: '.cell.group',
    NAME_CELL: '.cell.name',
    PACKETS_CELL: '.cell.packets',
    TRAFFIC_CELL: '.cell.traffic'
};
