import { UnifyIntentClient } from '../client';

declare global {
  interface Window {
    unify?: UnifyIntentClient;
  }
}

/**
 * Initializes the `UnifyIntentClient` and flushes pre-made method calls
 * from the global context if there are any.
 */
export const initBrowser = function () {
  // If the client has already been initialized, do nothing
  if (window.unify && !Array.isArray(window.unify)) {
    return;
  }

  // Get public API key from the script tag
  const scriptTag = document.getElementById('unifytag');
  const writeKey =
    scriptTag?.getAttribute('data-write-key') ??
    scriptTag?.getAttribute('data-api-key');

  if (!writeKey) return;

  // Instantiate the Unify client
  const unify = new UnifyIntentClient(writeKey, {
    autoPage: true,
    autoIdentify: true,
  });

  // Flush method calls which were made before this script loaded
  flushUnifyQueue(unify);

  // Re-assign the global Unify client object so future method calls
  // will go straight to the newly instantiated client
  window.unify = unify;
};

/**
 * It's possible that client code will execute functions on the global
 * `UnifyIntentClient` object before it is actually loaded and instantiated
 * because this code is loaded asynchronously by the client.
 *
 * Until `flushUnifyQueue` is called, `window.unify` is set to an array of queued
 * method calls, which are themselves each represented by an array. The first
 * element of each of these "method call subarrays" is the method name to call,
 * and the rest of the elements are the arguments to pass to that method.
 *
 * Once the Unify intent script is loaded and the `UnifyIntentClient` has
 * been instantiated, this function is called to flush the queued method
 * calls on the existing `window.unify` array if there are any to flush. It
 * iterates over each queued method call and applies that method and its
 * arguments to the newly instantiated `UnifyIntentClient`.
 *
 * @param unify - the `UnifyIntentClient` to apply method calls to
 */
function flushUnifyQueue(unify: UnifyIntentClient) {
  const queue: [string, ...unknown[]][] = Array.isArray(window.unify)
    ? [...window.unify]
    : [];

  queue.forEach(([method, ...args]) => {
    if (typeof unify[method as keyof UnifyIntentClient] === 'function') {
      try {
        // @ts-expect-error the type of the args is unknown at this point
        unify[method as keyof UnifyIntentClient].call(unify, ...args);
      } catch (error) {
        // Swallow errors so client is not potentially affected, this
        // should ideally never happen.
        console.warn(error);
      }
    }
  });
}

initBrowser();
