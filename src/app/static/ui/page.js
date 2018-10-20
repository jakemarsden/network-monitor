/**
 * @abstract
 */
export class Page {

    /**
     * @param {!Window} window
     * @param {...any} args Any additional arguments to pass to {@link #init}
     */
    constructor(window, ...args) {
        /**
         * @constant {!Window}
         */
        this.window = window;

        this.loadHandler_ = event => this.initDom();
        this.unloadHandler_ = event => this.destroy();
        this.init(...args);
    }

    /**
     * @param {...any} args
     * @protected
     */
    init(...args) {
        console.debug(`${this.constructor.name}#init: args=[${args.join(', ')}]`);
        this.window.addEventListener('load', this.loadHandler_);
        this.window.addEventListener('unload', this.unloadHandler_);
    }

    /**
     * @protected
     */
    initDom() {
        console.debug(`${this.constructor.name}#initDom`);
        /**
         * @constant {!Document}
         */
        this.root = this.window.document;
    }

    /**
     * @protected
     */
    destroy() {
        console.debug(`${this.constructor.name}#destroy`);
        this.window.removeEventListener('load', this.loadHandler_);
        this.window.removeEventListener('destroy', this.unloadHandler_);
    }
}
