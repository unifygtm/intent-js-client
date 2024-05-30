import StorageService from './storage';
/**
 * Storage service class for storing and retrieving data via cookies.
 */
export declare class CookieStorageService extends StorageService {
    /**
     * Retrieves an encoded value associated with a key from cookies.
     *
     * @param key - the key associated with the value to retrieve
     * @returns the encoded value from cookies if it exists, otherwise `null`
     */
    protected retrieveValue(key: string): string | null;
    /**
     * Stores an encoded value associated with a given key in cookies.
     *
     * @param key - the key associated with the value to store
     * @param encodedValue - the encoded value to store
     */
    protected storeValue(key: string, encodedValue: string): void;
}
//# sourceMappingURL=cookies.d.ts.map