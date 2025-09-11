import { decode, encode } from 'js-base64';

const TEST_STORAGE_VALUE = 'test';

/**
 * Helper function to parse a value from storage as either JSON or a string.
 *
 * @param value the value to parse
 * @returns the safely parsed value
 */
export function safeParse<T = unknown>(value: string): T | string {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

/**
 * @deprecated The intent client no longer encodes keys and values for
 * storage and instead stores them directly.
 *
 * Encodes an arbitrary value to base-64 encoding for storage.
 *
 * @param value - the value to encode, can be a string, object, etc.
 * @returns the base-64 encoded value
 */
export function encodeForStorage<T>(value: T): string {
  return encode(JSON.stringify(value));
}

/**
 * @deprecated The intent client no longer encodes keys and values for
 * storage and instead stores them directly.
 *
 * Decodes an encoded value which has been retrieved from storage.
 *
 * @param encodedValue - the value to decode
 * @returns the decoded value
 */
export function decodeFromStorage<T>(encodedValue: string): T {
  return safeParse(decode(encodedValue)) as T;
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
