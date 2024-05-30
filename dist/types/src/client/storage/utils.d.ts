/**
 * Encodes an arbitrary value to base-64 encoding for storage.
 *
 * @param value - the value to encode, can be a string, object, etc.
 * @returns the base-64 encoded value
 */
export declare function encodeForStorage<T>(value: T): string;
/**
 * Decodes an encoded value which has been retrieved from storage.
 *
 * @param encodedValue - the value to decode
 * @returns the decoded value
 */
export declare function decodeFromStorage<T>(encodedValue: string): T;
/**
 * Helper function to check if the current browser supports the
 * local storage API.
 *
 * @returns `true` if the browser supports local storage, otherwise `false`
 */
export declare function isLocalStorageAvailable(): boolean;
//# sourceMappingURL=utils.d.ts.map