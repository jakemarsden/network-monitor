import {InterfaceStat} from '../../domain/device.js';
import {InterfaceStatSerializer} from '../../domain/serialize/device-serializer.js';
import {ajax} from '../../util/ajax.js';
import {Page} from '../ui/page.js';
import {Table} from '../ui/table.js';
import './index.scss';
import {InterfaceStatsTableRow} from './interface-stats-table.js';

class MainPage extends Page {

    /**
     * @param {...any} args
     */
    init(...args) {
        super.init(...args);
        /**
         * @constant {InterfaceStatSerializer}
         * @private
         */
        this.interfaceStatSerializer = InterfaceStatSerializer.DEFAULT;
        /**
         * @constant {Promise<Array<InterfaceStat>>}
         * @private
         */
        this.interfaceStats = this.fetchInterfaceStats(); // Start ASAP, fuck waiting for #initDom
    }

    initDom() {
        super.initDom();
        /**
         * @constant {Table<InterfaceStat>}
         * @private
         */
        this.interfaceStatsTable = new Table(
                this.root.querySelector(MainPage.Selector.INTERFACE_STATS_TABLE),
                (root, data) => new InterfaceStatsTableRow(root, data));

        this.populateInterfaceStats();
    }

    destroy() {
        this.interfaceStatsTable.destroy();
        super.destroy();
    }

    /**
     * @return {Promise<Array<InterfaceStat>>}
     * @private
     */
    fetchInterfaceStats() {
        const opts = {
            headers: { 'Accept': 'application/json' },
            method: 'GET',
            url: '/api/interface-stat',
        };
        return ajax(opts)
                .then(response => this.interfaceStatSerializer.deserializeJson(response.text));
    }

    populateInterfaceStats() {
        const table = this.interfaceStatsTable;
        table.clearRows();
        this.interfaceStats.then(stats => {
            stats.forEach(stat => table.appendRow(stat));
            return stats;
        });
    }
}

/**
 * @constant {Object.<string, string>}
 * @private
 */
MainPage.Selector = {
    INTERFACE_STATS_TABLE: 'body.netmon .interface-stats.table'
};

new MainPage(window);
