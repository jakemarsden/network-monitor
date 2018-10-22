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

    /**
     * @param {!EventListener} handler
     * @param {number=} interval In milliseconds
     * @return {!EventListener} The wrapped listener
     */
    debounce(handler, interval = 200) {
        let timeoutId = null;
        return (...args) => {
            if (timeoutId !== null) {
                window.clearTimeout(timeoutId);
                timeoutId = null;
            }
            timeoutId = window.setTimeout(() => handler.apply(...args), interval);
        };
    }

    /**
     * @param {string} eventType
     * @param {!EventListener} handler
     */
    listen(eventType, handler) {
        this.root.addEventListener(eventType, handler);
    }

    /**
     * @param {string} eventType
     * @param {!EventListener} handler
     */
    unlisten(eventType, handler) {
        this.root.removeEventListener(eventType, handler);
    }

    /**
     * @param {string} eventType
     * @param {Object=} detail
     * @param {boolean=} shouldBubble
     */
    emit(eventType, detail = {}, shouldBubble = false) {
        let event;
        if (typeof CustomEvent === 'function') {
            event = new CustomEvent(eventType, { detail, bubbles: shouldBubble });
        } else {
            event = document.createEvent('CustomEvent');
            event.initCustomEvent(eventType, shouldBubble, false, detail);
        }
        this.root.dispatchEvent(event);
    }
}
