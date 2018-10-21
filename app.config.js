module.exports = {
    server: {
        host: '127.0.0.1',
        port: 3010,
        publicResourcesDir: 'dist'
    },
    db: {
        host: '127.0.0.1',
        port: 3306,
        database: 'ntopng',
        user: null,
        password: null
    },
    deviceGroups: null,
    deviceLabels: null,
    subnets: [
        'fc00::/7',       // IPv6 Unique Local Addresses (ULAs)
        'fe80::/10',      // IPv6 Link-Local
        '10.0.0.0/8',     // IPv4 Class A private
        '169.254.0.0/16', // IPv4 Automatic Private IP Addressing (APIPA)
        '172.16.0.0/12',  // IPv4 Class B private
        '192.168.0.0/16'  // IPv4 Class C private
    ]
};
