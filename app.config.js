const objectAssignDeep = require('object-assign-deep');
const path = require('path');
const process = require('process');
const secretConfig = require('./app-secret.config.js');

const config = {
    host: '0.0.0.0',
    port: 3010,
    db: {
        host: '127.0.0.1',
        port: 3306,
        database: 'ntopng',
        user: null,
        password: null
    },
    staticResources: {
        dir: path.join(process.cwd(), 'dist')
    }
};

module.exports = objectAssignDeep(config, secretConfig);
