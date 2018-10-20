const Address4 = require('ip-address').Address4;
const Address6 = require('ip-address').Address6;
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
    },
    subnets: [
        new Address4('10.10.0.0/16'),
        new Address6('fe80::/10')
    ]
};

module.exports = objectAssignDeep(config, secretConfig);
