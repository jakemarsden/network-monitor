/**
 * @template T
 */
export class Serializer {

    /**
     * @param {(T|Array<T>)} obj
     * @return {string}
     */
    serializeJson(obj) {
        const blob = this.serializeBlob(obj);
        return JSON.stringify(blob, null, 2);
    }

    /**
     * @param {string} str
     * @return {(T|Array<T>)}
     */
    deserializeJson(str) {
        const blob = JSON.parse(str);
        return this.deserializeBlob(blob);
    }

    /**
     * @param {(T|Array<T>)} obj
     * @return {any}
     */
    serializeBlob(obj) {
        if (obj == null) {
            return obj;
        }
        if (obj instanceof Array) {
            return obj.map(obj => this.serializeBlob_(obj));
        }
        return this.serializeBlob_(obj);
    }

    /**
     * @param {any} blob
     * @return {(T|Array<T>)}
     */
    deserializeBlob(blob) {
        if (blob == null) {
            return blob;
        }
        if (blob instanceof Array) {
            return blob.map(blob => this.deserializeBlob_(blob));
        }
        return this.deserializeBlob_(blob);
    }

    /**
     * @param {T} obj
     * @return {any}
     * @protected
     */
    serializeBlob_(obj) {
        return obj;
    }

    /**
     * @param {any} blob
     * @return {T}
     * @protected
     */
    deserializeBlob_(blob) {
        return blob;
    }
}

/**
 * @constant {Serializer<Object>}
 */
Serializer.DEFAULT = new Serializer();
