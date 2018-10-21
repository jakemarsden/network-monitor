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
    deviceGroups: null,
    deviceLabels: null,
    subnets: [
        new Address6('fc00::/7'),       // IPv6 Unique Local Addresses (ULAs)
        new Address6('fe80::/10'),      // IPv6 Link-Local
        new Address4('10.0.0.0/8'),     // IPv4 Class A private
        new Address4('169.254.0.0/16'), // IPv4 Automatic Private IP Addressing (APIPA)
        new Address4('172.16.0.0/12'),  // IPv4 Class B private
        new Address4('192.168.0.0/16')  // IPv4 Class C private
    ]
};

module.exports = objectAssignDeep(config, secretConfig);
