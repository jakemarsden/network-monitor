import fs from 'fs';
import http from 'http';
import path from 'path';
import url from 'url';
import config from './server-config.js';

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

const server = http.createServer((req, resp) => {
    console.info(`${req.method} ${req.url}`);
    try {
        serveResponse(req, resp);
    } catch (err) {
        serveInternalError(req, resp, err);
    }
});

server.listen(config.port, config.host, () =>
        console.log(`Server listening at http://${config.host}:${config.port}`));

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} resp
 */
function serveResponse(req, resp) {
    if (req.method !== 'GET') {
        serveIllegalMethod(req, resp);
        return;
    }
    if(req.url === '/') {
        serveRedirect(req, resp, '/index.html');
        return;
    }
    serveStaticResource(req, resp);
}

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} resp
 */
function serveStaticResource(req, resp) {
    const reqUrl = url.parse(req.url);
    const reqPath = path.normalize(reqUrl.pathname);
    const contentPath = path.join(config.staticResources.dir, reqPath);

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
 * @param {string}
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
    console.error(`500 Internal Server Error: ${req.method} ${req.url}: ${err}`);
    resp.writeHead(500, { 'Content-Type': 'text/plain' });
    resp.write(`500 Internal Server Error: ${err}`)
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
