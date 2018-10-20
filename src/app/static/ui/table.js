import {UiComponent} from './ui.js';

/**
 * @template TData
 */
export class Table extends UiComponent {

    /**
     * 
     * @param {(function(root: !HTMLTableRowElement, data: TData): !TableRow<TData>)=} rowFactory
     * @param  {...any} args
     */
    init(rowFactory = (root, data) => new TableRow(root, data), ...args) {
        /**
         * In insertion order but not necessarily in display order
         * @constant {Array<TableRow<TData>>}
         */
        this.rows = [];
        /**
         * @constant {function(root: !HTMLTableRowElement, data: TData): !TableRow<TData>}
         * @private
         */
        this.rowFactory_ = rowFactory;
    }

    initDom() {
        /**
         * @constant {!HTMLTemplateElement}
         * @private
         */
        this.rowTemplate_ = this.root.querySelector(Table.Selector.ROW_TEMPLATE);
    }

    destroy() {
        this.rows.forEach(row => row.destroy());
        this.rows.length = 0;
    }

    /**
     * @return {!HTMLTableSectionElementObject}
     */
    get thead() {
        return this.root.tHead;
    }

    /**
     * @return {!HTMLTableSectionElementObject}
     */
    get tfoot() {
        return this.root.tFoot;
    }

    /**
     * @return {!HTMLTableSectionElementObject}
     */
    get tbody() {
        return this.root.tBodies[0];
    }

    /**
     * @param {!TData} data
     * @return {TableRow<TData>}
     */
    appendRow(data) {
        const rowFrag = document.importNode(this.rowTemplate_.content, true);
        const row = this.rowFactory_(rowFrag.querySelector(Table.Selector.ROW_TEMPLATE_ROOT), data);
        this.rows.push(row);
        this.tbody.appendChild(row.root);
        return row;
    }

    clearRows() {
        const tbody = this.tbody;
        this.rows.forEach(row => tbody.removeChild(row.root));
        this.rows.forEach(row => row.destroy());
        this.rows.length = 0;
    }
}

/**
 * @constant {Object.<string, string>}
 * @private
 */
Table.Selector = {
    ROW_TEMPLATE: '.row-template',
    ROW_TEMPLATE_ROOT: '.row'
};

/**
 * @template TData
 */
export class TableRow extends UiComponent {

    /**
     * @param {!TData} data
     * @param {...any} args
     */
    init(data, ...args) {
        /**
         * @constant {TData}
         */
        this.data = data;
    }

    /**
     * @param {Object.<string, function(elem: !Element, data: !TData): void>} renderers A map of selectors to render
     * methods. Each render method will be called once for each element which matches its associated selector
     */
    render(renderers) {
        const root = this.root;
        const data = this.data;
        Object.entries(renderers).forEach(([selector, renderer]) =>
                root.querySelectorAll(selector).forEach(elem =>
                        renderer(elem, data)));
    }
}
