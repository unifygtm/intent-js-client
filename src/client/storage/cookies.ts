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

    // We used to set cookies on a specific subdomain, but to enable
    // re-using cookies across subdomains we deprecated this in favor
    // of setting cookies at the top-level domain only. This call to
    // `remove` will temporarily be used to remove old cookies stored
    // at the subdomain level in favor of storing them at the TLD.
    //
    // TODO(Solomon): Remove this after a few months have passed
    if (value) {
      // Remove subdomain-specific cookie
      Cookies.remove(key);

      // Store same cookie at top-level domain
      this.storeValue(key, value);
    }

    return value;
  }

  /**
   * Stores an encoded value associated with a given key in cookies.
   * This cookie can be shared across subdomains of the current
   * top-level domain.
   *
   * @param key - the key associated with the value to store
   * @param encodedValue - the encoded value to store
   */
  protected storeValue(key: string, encodedValue: string): void {
    Cookies.set(key, encodedValue, {
      domain: `.${getCurrentTopLevelDomain()}`,
      expires: 365,
    });
  }
}
