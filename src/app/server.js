import fs, {ReadStream} from 'fs';
import http, {IncomingMessage, OutgoingHttpHeaders, ServerResponse} from 'http';
import {Interval} from 'luxon';
import path from 'path';
import url, {UrlWithParsedQuery} from 'url';
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
    if (req.url === '/') {
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
    const reqUrl = url.parse(req.url, true);
    switch (reqUrl.pathname) {
        case '/api/device-stat':
            serveDeviceStatApiEndpoint(req, reqUrl, resp);
            break;
        default:
            serveNotFound(req, resp);
    }
}

/**
 * @param {IncomingMessage} req
 * @param {UrlWithParsedQuery} reqUrl
 * @param {ServerResponse} resp
 */
function serveDeviceStatApiEndpoint(req, reqUrl, resp) {
    if (req.method !== 'GET') {
        serveIllegalMethod(req, resp);
        return;
    }

    const reqInterval = reqUrl.query.interval;
    const interval = Interval.fromISO(reqInterval);
    if (!interval.isValid) {
        const msg = `Illegal or missing query parameter 'interval' (${interval.invalidReason}): '${reqInterval}'`;
        serveBadRequest(req, resp, new TypeError(msg));
        return;
    }

    service.aggregateDeviceStats(config.subnets, interval)
            .then(stats => serveJsonPayload(req, resp, stats, DeviceSerializer.DEFAULT))
            .catch(err => serveInternalError(req, resp, err));
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
        serveStream(req, resp, 200, 'OK', { 'Content-Type': contentType }, contentStream);
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
    serve(req, resp, 200, 'OK', { 'Content-Type': 'application/json' }, payloadJson);
}

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} resp
 * @param {string} targetLocation
 */
function serveRedirect(req, resp, targetLocation) {
    serve(req, resp, 308, 'Permanent Redirect', { 'Location': targetLocation }, undefined, targetLocation);
}

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} resp
 * @param {(Error|string)=} err
 */
function serveBadRequest(req, resp, err) {
    serveError(req, resp, 400, 'Bad Request', err);
}

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} resp
 */
function serveNotFound(req, resp) {
    serveError(req, resp, 404, 'Not Found');
}

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} resp
 */
function serveIllegalMethod(req, resp) {
    serveError(req, resp, 405, 'Method Not Allowed', req.method);
}

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} resp
 * @param {(Error|string)=} err
 */
function serveInternalError(req, resp, err) {
    serveError(req, resp, 500, 'Internal Server Error', err);
}

/**
 * @param {!IncomingMessage} req
 * @param {!ServerResponse} resp
 * @param {number} statusCode
 * @param {string} statusMsg
 * @param {OutgoingHttpHeaders=} headers
 * @param {!ReadStream} stream
 * @param {(Error|string)=} logMsg
 */
function serveStream(req, resp, statusCode, statusMsg, headers = {}, stream, logMsg = undefined) {
    stream.on('close', () => serve(req, resp, statusCode, statusMsg, headers, undefined, logMsg));
    stream.on('error', err => serveInternalError(req, resp, err));
    stream.pipe(resp);
}

/**
 * @param {!IncomingMessage} req
 * @param {!ServerResponse} resp
 * @param {number} statusCode
 * @param {string} statusMsg
 * @param {(Error|string)=} err
 */
function serveError(req, resp, statusCode, statusMsg, err = undefined) {
    let msg = `${statusCode} ${statusMsg}`;
    if (err !== undefined && err.stack) {
        msg += `:\n  ${err.stack}`;
    } else if (err !== undefined) {
        msg += `: ${err}`;
    }
    serve(req, resp, statusCode, statusMsg, { 'Content-Type': 'text/plain' }, msg, err);
}

/**
 * @param {!IncomingMessage} req
 * @param {!ServerResponse} resp
 * @param {number} statusCode
 * @param {string} statusMsg
 * @param {OutgoingHttpHeaders=} headers
 * @param {any=} body
 * @param {(Error|string)=} logMsg
 */
function serve(req, resp, statusCode, statusMsg, headers = {}, body = undefined, logMsg = undefined) {
    let msg = `${statusCode} ${statusMsg}`;
    if (statusCode >= 200 && statusCode < 300 && headers['Content-Type']) {
        msg += ` [${headers['Content-Type']}]`;
    }
    if (logMsg !== undefined && logMsg.stack) {
        msg += `:\n  ${logMsg.stack}`;
    } else if (logMsg !== undefined) {
        msg += `: ${logMsg}`;
    }

    let logger = console.info;
    if (statusCode >= 300 && statusCode < 400) {
        logger = console.debug;
    }
    if (statusCode >= 400 && statusCode < 500) {
        logger = console.warn;
    }
    if (statusCode >= 500 && statusCode < 600) {
        logger = console.error;
    }
    logger(`${req.method} ${req.url} -> ${msg}`);

    resp.writeHead(statusCode, statusMsg, headers);
    if (body !== undefined) {
        resp.write(body);
    }
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
