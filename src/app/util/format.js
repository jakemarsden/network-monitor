import filesize from 'filesize';

const size = filesize.partial({
    bits: false, // `true` means use kilo*bits*, mega*bits*... while `false` means use kilo*bytes*, mega*bytes*...
    output: 'array',
    standard: 'iec'
});

/**
 * @param {number} n
 * @return {string}
 */
export function formatInteger(n) {
    return Number(n).toLocaleString();
}

/**
 * @param {number} n
 * @param {number=} dp
 * @return {string}
 */
export function formatDecimal(n, dp = 2) {
    return Number(n).toLocaleString(undefined, { minimumFractionDigits: dp });
}

/**
 * @param {number} bytes
 * @return {string}
 */
export function formatBytes(bytes) {
    const parts = size(bytes);
    return `${formatDecimal(parts[0])} ${parts[1]}`;
}
