/**
 * @abstract
 */
export class UiComponent {

    /**
     * @param {!Element} root
     * @param {...any} args Any additional arguments to pass to {@link #init}
     */
    constructor(root, ...args) {
        /**
         * @constant {!Elelemnt}
         */
        this.root = root;
        this.init(...args);
        this.initDom();
    }

    /**
     * @param {...any} args
     * @protected
     */
    init(...args) {
    }

    /**
     * @protected
     */
    initDom() {
    }

    /**
     * @protected
     */
    destroy() {
    }
}
