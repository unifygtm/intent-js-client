/**
 * Abstract class for storing generic key/value pairs in a storage service.
 */
declare abstract class StorageService {
    private readonly _writeKey;
    constructor(writeKey: string);
    /**
     * Given a generated key, retrieves a value from the underlying
     * storage service.
     *
     * @param key - the generated key to retrieve the associated value for
     * @returns the value associated with the key
     */
    protected abstract retrieveValue(key: string): string | null;
    /**
     * Stores an already-encoded value associated with a given
     * generated key within the underlying storage service.
     *
     * @param key - the generated key to associate with the stored value
     * @param encodedValue - the encoded value to store
     */
    protected abstract storeValue(key: string, encodedValue: string): void;
    /**
     * Gets a value from the underlying storage service by key name.
     *
     * @param key - the key associated with the value to get
     * @returns the value from storage if it exists, otherwise `null`
     */
    get: <T>(key: string) => T | null;
    /**
     * Stores a value in the underlying storage service associated with
     * the given key.
     *
     * @param key - the key to associate with the value to be stored
     * @param value - the value to store
     */
    set: <T>(key: string, value: T) => void;
    /**
     * Generates a unique key using the public Unify API key for
     * storing a value in the underlying storage service.
     *
     * @param suffix - the identifying key to associate with some
     *        value to be stored
     * @returns a "generated" key which includes the given suffix
     *          prefixed with the public Unify API key
     */
    private buildKey;
}
export default StorageService;
//# sourceMappingURL=storage.d.ts.map