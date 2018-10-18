import './index.scss';
import {Page} from '../page.js';

class MainPage extends Page {

    /**
     * @param {...any} args
     */
    init(...args) {
        super.init(...args);
    }

    initDom() {
        super.initDom();
    }

    destroy() {
        super.destroy();
    }
}

new MainPage(window);
