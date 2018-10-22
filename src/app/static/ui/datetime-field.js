import {DateTime, Duration} from 'luxon';
import {UiComponent} from './ui.js';

export class DateTimeField extends UiComponent {

    /**
     * @param {...any} args
     */
    init(...args) {
        /**
         * @constant {EventListener}
         * @private
         */
        this.changeHandler_ = this.debounce(event => this.emit(DateTimeField.Event.CHANGE));
    }

    initDom() {
        const S = DateTimeField.Selector;
        const root = this.root;
        /**
         * @constant {HTMLInputElement}
         * @private
         */
        this.dateInput_ = root.querySelector(S.DATE_INPUT);
        /**
         * @constant {HTMLInputElement}
         * @private
         */
        this.timeInput_ = root.querySelector(S.TIME_INPUT);

        this.dateInput_.addEventListener('change', this.changeHandler_);
        this.timeInput_.addEventListener('change', this.changeHandler_);
    }

    destroy() {
        this.dateInput_.removeEventListener('change', this.changeHandler_);
        this.timeInput_.removeEventListener('change', this.changeHandler_);
    }

    /**
     * @return {Duration}
     */
    get step() {
        const seconds = this.timeInput_.step;
        return Duration.fromObject({ seconds });
    }

    /**
     * @return {DateTime}
     */
    get value() {
        const isShowingSeconds = this.step.as('seconds') < 60;
        const value = `${this.dateInput_.value} ${this.timeInput_.value}`;
        const format = `yyyy-MM-dd ${isShowingSeconds ? 'HH:mm:ss' : 'HH:mm'}`;
        return DateTime.fromFormat(value, format, { zone: 'local' }).toUTC();
    }

    /**
     * @param {DateTime} value
     */
    set value(value) {
        const shouldShowSeconds = this.step.as('seconds') < 60;
        const local = value.toLocal();
        this.dateInput_.value = local.toFormat('yyyy-MM-dd');
        this.timeInput_.value = local.toFormat(shouldShowSeconds ? 'HH:mm:ss' : 'HH:mm');
    }
}

/**
 * @enum {string}
 * @readonly
 */
DateTimeField.Event = {
    CHANGE: 'DateTimeField:change'
};

/**
 * @enum {string}
 * @readonly
 * @private
 */
DateTimeField.Selector = {
    DATE_INPUT: '.date.input',
    TIME_INPUT: '.time.input'
};
