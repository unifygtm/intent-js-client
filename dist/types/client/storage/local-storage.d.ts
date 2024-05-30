import StorageService from './storage';
/**
 * Storage service class for storing and retrieving data via the
 * browser local storage API. Requires the current browser to
 * support local storage.
 */
export declare class LocalStorageService extends StorageService {
    private readonly _localStorageAvailable;
    constructor(writeKey: string);
    /**
     * Retrieves an encoded value associated with a key from local storage.
     *
     * @param key - the key associated with the value to retrieve
     * @returns the encoded value from local storage if it exists,
     *          otherwise `null`
     */
    protected retrieveValue: (key: string) => string | null;
    /**
     * Stores an encoded value associated with a given key in local storage.
     *
     * @param key - the key associated with the value to store
     * @param encodedValue - the encoded value to store
     */
    protected storeValue: (key: string, encodedValue: string) => void;
}
//# sourceMappingURL=local-storage.d.ts.map