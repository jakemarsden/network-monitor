import objectAssignDeep from 'object-assign-deep';
import path from 'path';
import process from 'process';
import {IpAddress} from '../domain/ip-address.js';

/**
 * @constant {AppConfig}
 * @readonly
 */
export default evaluateAppConfig();

/**
 * @typedef AppConfig
 * @property {AppConfig~Server} server
 * @property {AppConfig~DatabaseConnection} db
 * @property {Map<IpAddress, string>} deviceGroups
 * @property {Map<IpAddress, string>} deviceLabels
 * @property {Array<IpAddress>} subnets
 */

/**
 * @typedef AppConfig~Server
 * @property {string} host
 * @property {number} port
 * @property {string} publicResourcesDir
 */

/**
 * @typedef AppConfig~DatabaseConnection
 * @property {string} host
 * @property {number} port
 * @property {string} database
 * @property {string} user
 * @property {string} password
 */

/**
 * @return {AppConfig}
 */
function evaluateAppConfig() {
    const dir = process.cwd();
    const rawAppConfig = readConfig(path.join(dir, 'app.config.js'));
    const rawSecretConfig = readConfig(path.join(dir, 'app-secret.config.js'));

    const rawConfig = mergeConfigs(rawAppConfig, rawSecretConfig);
    const config = parseConfig(rawConfig);
    return config;
}

/**
 * @param {any} config
 * @return {AppConfig}
 */
function parseConfig(config) {
    config = config || {};
    config.server = config.server || {};
    config.server.publicResourcesDir = config.server.publicResourcesDir &&
            path.join(process.cwd(), config.server.publicResourcesDir);
    config.db = config.db || {};
    config.deviceGroups = parseIpAddressDict(config.deviceGroups || {});
    config.deviceLabels = parseIpAddressDict(config.deviceLabels || {});
    config.subnets = (config.subnets || []).map(it => IpAddress.fromString(it));
    return config;
}

/**
 * @param {Object.<string, T>} dict
 * @return {Map<IpAddress, T>}
 * @template T
 */
function parseIpAddressDict(dict) {
    const map = new Map();
    Object.entries(dict)
            .map(([addr, value]) => [IpAddress.fromString(addr), value])
            .forEach(([addr, value]) => map.set(addr, value));
    return map;
}

/**
 * @param {...any} configs
 * @return {any}
 */
function mergeConfigs(...configs) {
    return objectAssignDeep(...configs);
}

/**
 * @param {string} fileName
 * @return {any}
 */
function readConfig(filePath) {
    let config;
    try {
        config = require(filePath);
        if (typeof config === 'function') {
            config = config();
        }
    } catch (err) {
        console.error(`Unable to read app config file: '${filePath}'`);
        throw err;
    }
    return config;
}
