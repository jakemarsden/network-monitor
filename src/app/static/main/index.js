import {DateTime, Interval} from 'luxon';
import {Device, DeviceGroup} from '../../domain/device.js';
import {DeviceSerializer} from '../../domain/serialize/device-serializer.js';
import {ajax} from '../../util/ajax.js';
import {DateTimeField} from '../ui/datetime-field.js';
import {Page} from '../ui/page.js';
import {DeviceGroupsUi} from './device-group-ui.js';
import './index.scss';

class MainPage extends Page {

    /**
     * @param {...any} args
     */
    init(...args) {
        super.init(...args);
        /**
         * @constant {Serializer<Device>}
         * @private
         */
        this.deviceSerializer_ = DeviceSerializer.DEFAULT;

        /**
         * @constant {EventListener}
         * @private
         */
        this.intervalChangeHandler_ = event => this.populateDeviceGroups(this.interval);
    }

    initDom() {
        super.initDom();
        const localNow = DateTime.local();
        const utcToday = Interval.fromDateTimes(localNow.startOf('day').toUTC(), localNow.endOf('day').toUTC());

        const S = MainPage.Selector;
        /**
         * @constant {DeviceGroupsUi}
         * @private
         */
        this.deviceGroupsUi_ = new DeviceGroupsUi(this.root.querySelector(S.DEVICE_GROUPS));
        /**
         * @constant {DateTimeField}
         * @private
         */
        this.startDateTime_ = new DateTimeField(this.root.querySelector(S.START_DATETIME));
        /**
         * @constant {DateTimeField}
         * @private
         */
        this.endDateTime_ = new DateTimeField(this.root.querySelector(S.END_DATETIME));

        this.interval = utcToday;
        this.startDateTime_.listen(DateTimeField.Event.CHANGE, this.intervalChangeHandler_);
        this.endDateTime_.listen(DateTimeField.Event.CHANGE, this.intervalChangeHandler_);

        this.populateDeviceGroups(utcToday);
    }

    destroy() {
        this.startDateTime_.unlisten(DateTimeField.Event.CHANGE, this.intervalChangeHandler_);
        this.endDateTime_.unlisten(DateTimeField.Event.CHANGE, this.intervalChangeHandler_);

        this.deviceGroupsUi_.destroy();
        this.startDateTime_.destroy();
        this.endDateTime_.destroy();
        super.destroy();
    }

    /**
     * @return {Interval}
     */
    get interval() {
        const start = this.startDateTime_.value;
        const end = this.endDateTime_.value;
        return Interval.fromDateTimes(start, end);
    }

    /**
     * @param {Interval} interval
     */
    set interval(interval) {
        this.startDateTime_.value = interval.start;
        this.endDateTime_.value = interval.end;
    }

    /**
     * @param {Interval} interval
     */
    populateDeviceGroups(interval) {
        const groups = this.fetchDeviceGroups_(interval);
        const groupsUi = this.deviceGroupsUi_;
        groupsUi.clearGroups();
        groups.then(groups => groups.forEach(group => groupsUi.appendGroup(group)));
    }

    /**
     * @param {Interval} interval
     * @return {Promise<Array<DeviceGroup>>}
     * @private
     */
    fetchDeviceGroups_(interval) {
        if (!interval.isValid) {
            throw new TypeError(`Illegal interval (${interval.invalidReason}): ${interval}`);
        }
        const opts = {
            headers: { 'Accept': 'application/json' },
            method: 'GET',
            url: `/api/device-stat?interval=${interval.toISO()}`,
        };
        return ajax(opts)
                .then(response => this.deviceSerializer_.deserializeJson(response.text))
                .then(devices => this.aggregateDeviceGroups_(devices));
    }

    /**
     * @param {Array<Device>} devices
     * @return {Array<DeviceGroup>}
     * @private
     */
    aggregateDeviceGroups_(devices) {
        /**
         * @constant {Map<string, DeviceGroup>}
         */
        const groups = new Map();
        devices.forEach(device => {
            let group = groups.get(device.group);
            if (group === undefined) {
                group = new DeviceGroup();
                group.name = device.group;
                group.devices = [];
                groups.set(group.name, group);
            }
            group.devices.push(device);
        });
        return Array.from(groups.values());
    }
}

/**
 * @constant {Object.<string, string>}
 * @private
 */
MainPage.Selector = {
    DEVICE_GROUPS: 'body.netmon .device-groups',
    START_DATETIME: 'body.netmon .control .start-datetime',
    END_DATETIME: 'body.netmon .control .end-datetime'
};

new MainPage(window);
