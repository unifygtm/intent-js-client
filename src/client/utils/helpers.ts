import { PageProperties, UserAgentDataType } from '../../types';

const EMAIL_REGEX = /^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$/;

const TEST_CLIENT_PROPERTIES = ['identify', 'page'];

/**
 * Helper function to check if a value is an instance of the global Unify
 * Intent Client. The following checks are performend:
 *
 * 1. Is the value an object? The intent client will always be.
 * 2. Is the value defined? For obvious reasons.
 * 3. Is the value NOT an array? We temporarily stub the intent client as
 *    an array in the global context to queue method calls before the client loads.
 * 4. Are the expected properties in the object? This is to protect against
 *    a bug where customers accidentally override the global variable we
 *    normally store the intent client at by setting the `id` of an element
 *    in the DOM equal to the same name. For example, creating a `<script>`
 *    tag with `id="unify"` will override `window.unify` to be the `<script>`
 *    HTML element.
 *
 * @param value - the value to check is an instance of the intent client
 * @returns `true` if the value is an instance of the intent client, or else `false`
 */
export function isIntentClient(value: unknown) {
  return (
    !!value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    TEST_CLIENT_PROPERTIES.every((property) => property in value)
  );
}

/**
 * Gets a milliseconds since epoch for `minutes` in the future.
 *
 * @param minutes - number of minutes in the future
 * @param fromTime - the relative time to calculate in the future from
 * @returns the corresponding milliseconds since epoch
 */
export function getTimeForMinutesInFuture(
  minutes: number,
  fromTime?: Date,
): number {
  return (fromTime?.getTime() ?? new Date().getTime()) + minutes * 60 * 1000;
}

/**
 * Gets the properties of the current page used in intent logging.
 *
 * @param pathname - optional pathname to use instead of the current pathname
 *        when constructing page properties. This allows supporting logging
 *        a page other than the one the user is currently on.
 * @returns a set of properties for the specified or current page
 */
export const getCurrentPageProperties = (
  pathname?: string,
): PageProperties => ({
  path: pathname ?? window.location.pathname,
  query: parseUrlQueryParams(window.location.href),
  referrer: document.referrer,
  title: document.title,
  url:
    pathname !== undefined
      ? getLocationHrefWithCustomPath({ location: window.location, pathname })
      : window.location.href,
});

/**
 * This function will replace the pathname for a given `location.href`
 * with the specified custom pathname. This is more complicated than
 * a simple `replace` because the pathname can be simply "/" which can
 * occur in the URL before the pathname (i.e. after the protocol).
 *
 * @param location - the location containing the `href` to replace the
 *        pathname for
 * @param pathname - the custom pathname to replace the existing one with
 * @returns the `location.href` with `pathname` replacing the existing pathname
 */
export function getLocationHrefWithCustomPath({
  location,
  pathname,
}: {
  location: Location;
  pathname: string;
}) {
  const url = new URL(location.href);
  url.pathname = pathname;

  return url.toString();
}

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
