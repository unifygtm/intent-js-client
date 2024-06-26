import { decodeFromStorage, encodeForStorage } from './utils';

/**
 * Abstract class for storing generic key/value pairs in a storage service.
 */
abstract class StorageService {
  private readonly _writeKey: string;

  constructor(writeKey: string) {
    this._writeKey = writeKey;
  }

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
  public get = <T>(key: string): T | null => {
    const encodedValue = this.retrieveValue(this.buildKey(key));
    if (encodedValue) {
      return decodeFromStorage(encodedValue);
    }

    return null;
  };

  /**
   * Stores a value in the underlying storage service associated with
   * the given key.
   *
   * @param key - the key to associate with the value to be stored
   * @param value - the value to store
   */
  public set = <T>(key: string, value: T): void => {
    this.storeValue(this.buildKey(key), encodeForStorage(value));
  };

  /**
   * Generates a unique key using the public Unify API key for
   * storing a value in the underlying storage service.
   *
   * @param suffix - the identifying key to associate with some
   *        value to be stored
   * @returns a "generated" key which includes the given suffix
   *          prefixed with the public Unify API key
   */
  private buildKey = (suffix: string): string => {
    return encodeForStorage(`${this._writeKey}_${suffix}`);
  };
}

export default StorageService;
