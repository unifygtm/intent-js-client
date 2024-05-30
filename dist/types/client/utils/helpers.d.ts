import { PageProperties, UserAgentDataType } from '../../types';
/**
 * Gets a milliseconds since epoch for `minutes` in the future.
 *
 * @param minutes - number of minutes in the future
 * @param fromTime - the relative time to calculate in the future from
 * @returns the corresponding milliseconds since epoch
 */
export declare function getTimeForMinutesInFuture(minutes: number, fromTime?: Date): number;
/**
 * Gets the properties of the current page used in intent logging.
 */
export declare const getCurrentPageProperties: () => PageProperties;
/**
 * Gets the current user agent data used in intent logging.
 */
export declare const getCurrentUserAgentData: () => UserAgentDataType;
/**
 * Validates a user-entered email address.
 *
 * @param email - the email address to validate
 * @returns the email address if valid, otherwise `undefined`
 */
export declare const validateEmail: (email: string) => string | undefined;
/**
 * Extract the key-value query parameters from a URL.
 *
 * @param url - URL to parse.
 * @returns Object containing the query parameters as key-value pairs.
 */
export declare const parseUrlQueryParams: (url: string) => Record<string, string>;
//# sourceMappingURL=helpers.d.ts.map