const path = require('path');
const process = require('process');
const secretConfig = require('./app-secret.config.js');

const config = {
    host: '0.0.0.0',
    port: 3010,
    staticResources: {
        dir: path.join(process.cwd(), 'dist')
    }
};

module.exports = Object.assign(config, secretConfig);
