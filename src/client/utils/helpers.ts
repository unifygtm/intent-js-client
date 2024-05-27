import { PageProperties } from '../../types';

import { UserAgentDataType } from '../../types';

const EMAIL_REGEX = /^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$/;

/**
 * Gets a milliseconds since epoch for `minutes` in the future.
 *
 * @param minutes - number of minutes in the future
 * @param fromTime - the relative time to calculate in the future from
 * @returns the corresponding milliseconds since epoch
 */
export function getTimeForMinutesInFuture(
  minutes: number,
  fromTime?: Date
): number {
  return (fromTime?.getTime() ?? new Date().getTime()) + minutes * 60 * 1000;
}

/**
 * Gets the properties of the current page used in intent logging.
 */
export const getCurrentPageProperties = (): PageProperties => ({
  path: window.location.pathname,
  query: parseUrlQueryParams(window.location.href),
  referrer: document.referrer,
  title: document.title,
  url: window.location.href,
});

/**
 * Gets the current user agent data used in intent logging.
 */
export const getCurrentUserAgentData = (): UserAgentDataType => ({
  userAgent: window.navigator.userAgent,
  userAgentData: window.navigator.userAgentData,
});

/**
 * Validates a user-entered email address.
 *
 * @param email - the email address to validate
 * @returns the email address if valid, otherwise `undefined`
 */
export const validateEmail = (email: string): string | undefined => {
  if (!EMAIL_REGEX.test(email)) {
    return undefined;
  }

  return email;
};

/**
 * Extract the key-value query parameters from a URL.
 *
 * @param url - URL to parse.
 * @returns Object containing the query parameters as key-value pairs.
 */
export const parseUrlQueryParams = (url: string): Record<string, string> => {
  const params = new URL(url).searchParams;
  const queryParams: Record<string, string> = {};
  for (const [key, value] of params.entries()) {
    queryParams[key] = value;
  }

  return queryParams;
};
