import { decode, encode } from 'js-base64';

const TEST_STORAGE_VALUE = 'test';

/**
 * Encodes an arbitrary value to base-64 encoding for storage.
 *
 * @param value - the value to encode, can be a string, object, etc.
 * @returns the base-64 encoded value
 */
export function encodeForStorage<T>(value: T): string {
  return encode(JSON.stringify(value));
}

/**
 * Decodes an encoded value which has been retrieved from storage.
 *
 * @param encodedValue - the value to decode
 * @returns the decoded value
 */
export function decodeFromStorage<T>(encodedValue: string): T {
  return JSON.parse(decode(encodedValue)) as T;
}

/**
 * Helper function to check if the current browser supports the
 * local storage API.
 *
 * @returns `true` if the browser supports local storage, otherwise `false`
 */
export function isLocalStorageAvailable() {
  try {
    localStorage.setItem(TEST_STORAGE_VALUE, TEST_STORAGE_VALUE);
    localStorage.removeItem(TEST_STORAGE_VALUE);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Helper function to get the current top-level domain from location.
 * For example, if the current location is "app.unifygtm.com", this
 * will return "unifygtm.com".
 *
 * @param hostname - optional param to use instead of the current location
 * @returns the top-level domain associated with the location
 */
export function getCurrentTopLevelDomain(hostname?: string) {
  return (hostname ?? window.location.hostname).split('.').slice(-2).join('.');
}
