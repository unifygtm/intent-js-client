import Cookies from 'js-cookie';

import StorageService from './storage';
import { getCurrentTopLevelDomain } from './utils';

/**
 * Storage service class for storing and retrieving data via cookies.
 */
export class CookieStorageService extends StorageService {
  /**
   * Retrieves an encoded value associated with a key from cookies.
   *
   * @param key - the key associated with the value to retrieve
   * @returns the encoded value from cookies if it exists, otherwise `null`
   */
  protected retrieveValue(key: string): string | null {
    const value = Cookies.get(key) ?? null;

    // Reset the cookie expiration
    if (value) {
      this.storeValue(key, value);
    }

    return value;
  }

  /**
   * Stores a value associated with a given key in cookies.
   * This cookie can be shared across subdomains of the current
   * top-level domain.
   *
   * @param key - the key associated with the value to store
   * @param value - the value to store
   */
  protected storeValue(key: string, value: string): void {
    Cookies.set(key, value, {
      domain: `.${getCurrentTopLevelDomain()}`,
      expires: 400,
    });
  }
}
