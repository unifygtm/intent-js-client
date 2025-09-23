import { version } from '../../../package.json';

import UnifyApiClient from '../unify-api-client';

const UNIFY_LOGGER_URL = 'https://api.unifyintent.com/logs';

/**
 * This function is used to log all errors which occur in the
 * Unify Intent Client. We don't log any messages in the console
 * beyond `debug` so as to not pollute users' dev consoles.
 *
 * @param message - the error message to log
 */
export function logUnifyError({
  message,
  error,
  attrs,
  apiClient,
}: {
  message: string;
  error?: Error;
  attrs?: Record<string, unknown>;
  apiClient?: UnifyApiClient;
}) {
  console.debug(
    `%c[Unify]: %c${message}${error ? `: ${error.message}` : ''}${
      attrs ? `, data: ${JSON.stringify(attrs)}` : ''
    }`,
    'font-weight: bold;',
    '',
  );

  const logAttrs =
    attrs &&
    Object.entries(attrs).reduce(
      (map, [key, value]) => ({
        ...map,
        [key]: typeof value === 'string' ? value : JSON.stringify(value),
      }),
      {},
    );

  apiClient?.post(UNIFY_LOGGER_URL, {
    status: 'error',
    message,
    attrs: logAttrs,
    name: error?.name,
    stack: error?.stack,
    version,
  });
}
