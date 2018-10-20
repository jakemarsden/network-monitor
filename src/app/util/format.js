import filesize from 'filesize';

const size = filesize.partial({
    bits: true,
    standard: 'iec'
});

/**
 * @param {number} bytes
 * @return {string}
 */
export function humanReadableSize(bytes) {
    return size(bytes);
}
