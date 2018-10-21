import fs from 'fs';
import http from 'http';
import path from 'path';
import url from 'url';
import config from './config/config.js';
import {DbFactory} from './db/db-factory.js';
import {DbOperations} from './db/db-operations.js';
import {DeviceSerializer} from './domain/serialize/device-serializer.js';
import {Serializer} from './domain/serialize/serializer.js';
import {Service} from './service/service.js';

const MIME_TYPES = {
    '.css': 'text/css',
    '.css.map': 'application/json',
    '.gif': 'image/gif',
    '.html': 'text/html',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.js': 'text/javascript',
    '.js.map': 'application/json',
    '.json': 'application/json',
    '.png': 'image/png'
};

let service;
{
    const db = new DbFactory(config.db);
    const dbOps = new DbOperations(db);
    service = new Service(dbOps, config.deviceGroups, config.deviceLabels);
}

const server = http.createServer((req, resp) => {
    console.info(`${req.method} ${req.url}`);
    try {
        serveResponse(req, resp);
    } catch (err) {
        serveInternalError(req, resp, err);
    }
});
server.listen(config.server.port, config.server.host, () =>
        console.info(`Server listening at: http://${config.server.host}:${config.server.port}`));

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} resp
 */
function serveResponse(req, resp) {
    if(req.url === '/') {
        serveRedirect(req, resp, '/index.html');
        return;
    }
    if (req.url.startsWith('/api')) {
        serveApiEndpoint(req, resp);
        return;
    }
    serveStaticResource(req, resp);
}

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} resp
 */
function serveApiEndpoint(req, resp) {
    if (req.url === '/api/device-stat') {
        if (req.method !== 'GET') {
            serveIllegalMethod(req, resp);
            return;
        }
        service.aggregateDeviceStats(config.subnets)
                .then(stats => serveJsonPayload(req, resp, stats, DeviceSerializer.DEFAULT))
                .catch(err => serveInternalError(req, resp, err));
        return;
    }
    serveNotFound(req, resp);
}

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} resp
 */
function serveStaticResource(req, resp) {
    if (req.method !== 'GET') {
        serveIllegalMethod(req, resp);
        return;
    }

    const reqUrl = url.parse(req.url);
    const reqPath = path.normalize(reqUrl.pathname);
    const contentPath = path.join(config.server.publicResourcesDir, reqPath);

    fs.lstat(contentPath, (err, stat) => {
        if (err != null) {
            err.code === 'ENOENT' ?
                    serveNotFound(req, resp) :
                    serveInternalError(req, resp, err);
            return;
        }
        if (!stat.isFile()) {
            serveNotFound(req, resp);
            return;
        }
        const contentStream = fs.createReadStream(contentPath);
        const contentType = parseContentType(reqPath);
        contentStream.on('open', () => resp.writeHead(200, { 'Content-Type': contentType }));
        contentStream.on('error', err => serveInternalError(req, resp, err));
        contentStream.pipe(resp);
    });
}

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} resp
 * @param {T} payload
 * @param {Serializer<T>=} serializer
 * @template T
 */
function serveJsonPayload(req, resp, payload, serializer = Serializer.DEFAULT) {
    const payloadJson = serializer.serializeJson(payload);
    resp.writeHead(200, { 'Content-Type': 'application/json' });
    resp.write(payloadJson);
    resp.end();
}

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} resp
 * @param {string} targetLocation
 */
function serveRedirect(req, resp, targetLocation) {
    console.debug(`302 Redirect: ${targetLocation}`);
    resp.writeHead(302, { 'Location': targetLocation });
    resp.end();
}

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} resp
 */
function serveNotFound(req, resp) {
    console.warn(`404 Not Found: ${req.method} ${req.url}`);
    resp.writeHead(404, { 'Content-Type': 'text/plain' });
    resp.write('404 Not Found');
    resp.end();
}

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} resp
 */
function serveIllegalMethod(req, resp) {
    console.warn(`405 Method Not Allowed: ${req.method} ${req.url}`);
    resp.writeHead(405, { 'Content-Type': 'text/plain' });
    resp.write(`405 Method Not Allowed: '${req.method}'`);
}

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} resp
 * @param {Error=} err
 */
function serveInternalError(req, resp, err) {
    console.error(`500 Internal Server Error: ${req.method} ${req.url}: ${err}${err && '\n' + err.stack}`);
    resp.writeHead(500, { 'Content-Type': 'text/plain' });
    resp.write(`500 Internal Server Error: ${err}${err && '\n' + err.stack}`)
    resp.end();
}

/**
 * @param {string} path
 * @return {string}
 */
function parseContentType(path) {
    for (const [ext, type] of Object.entries(MIME_TYPES)) {
        if (path.endsWith(ext)) {
            return type;
        }
    }
    return 'application/octet-stream';
}
