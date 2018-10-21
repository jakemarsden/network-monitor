import {InterfaceStat} from '../../domain/device.js';
import {formatBytes, formatInteger} from '../../util/format.js';
import {TableRow} from '../ui/table.js';

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
