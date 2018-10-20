import nanoajax from 'nanoajax';

/**
 * @param {nanoajax.RequestParameters} params
 * @return {Promise<Response>}
 */
export function ajax(params) {
    return new Promise((resolve, reject) =>
            nanoajax.ajax(params, (statusCode, responseText) =>
                    handleResponse(resolve, reject, statusCode, responseText)));
}

export class AjaxError extends Error {

    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}

/**
 * @typedef {Object} Response
 * @property {number} statusCode
 * @property {string} text
 */

function handleResponse(resolve, reject, statusCode, responseText) {
    const response = {
        statusCode,
        text: responseText
    };
    if (statusCode !== 200) {
        const msg = `Error executing endpoint: statusCode=${statusCode}, responseText=${responseText}`;
        reject(new AjaxError(msg));
        return;
    }
    resolve(response);
}
