import {InterfaceStat} from '../../domain/device.js';
import {humanReadableSize} from '../../util/format.js';
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
            [S.PACKETS_CELL]: (elem, data) => elem.textContent = data.packets,
            [S.TRAFFIC_CELL]: (elem, data) => elem.textContent = humanReadableSize(data.traffic)
        });
    }
}

/**
 * @constant {Object.<string, string>}
 * @private
 */
InterfaceStatsTableRow.Selector = {
    ADDRESS_CELL: '.cell.address',
    PACKETS_CELL: '.cell.packets',
    TRAFFIC_CELL: '.cell.traffic'
};
