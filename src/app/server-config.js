import path from 'path';
import process from 'process';

const CONFIG_PATH = path.join(process.cwd(), 'app.config.js');

let config = null;
try {
    config = require(CONFIG_PATH);
    config = (typeof config === 'function') ? config() : config;
} catch (err) {
    console.error(`Application config not found: '${CONFIG_PATH}'`);
    throw err;
}

/**
 * @constant {!AppConfig}
 */
export default config;

/**
 * @typedef {Object} AppConfig
 * @property {string} host
 * @property {number} port
 * @property {AppConfig~Db} db
 * @property {Object} staticResources
 * @property {string} staticResources.dir
 */

/**
 * @typedef {Object} AppConfig~Db
 * @property {string} host
 * @property {number} port
 * @property {string} database
 * @property {string} user
 * @property {string} password
 */
