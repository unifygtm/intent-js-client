import { UnifyIntentClient } from '../client';
import { logUnifyError } from '../client/utils/logging';

/**
 * Initializes the `UnifyIntentClient` and flushes pre-made method calls
 * from the global context if there are any.
 */
export const initBrowser = function () {
  // If not running in a browser environment, do nothing
  if (typeof window === 'undefined') return;

  // If the client has already been initialized, do nothing
  if (window.unify !== undefined && !Array.isArray(window.unify)) {
    logUnifyError({
      message:
        'UnifyIntentClient already exists on window, a new one will not be created.',
    });
    return;
  }

  // Get public API key from the script tag
  const scriptTag = document.getElementById('unifytag');
  const writeKey =
    scriptTag?.getAttribute('data-write-key') ??
    scriptTag?.getAttribute('data-api-key');

  if (!writeKey) return;

  // Instantiate the Unify client and mount it
  new UnifyIntentClient(writeKey, {
    autoPage: true,
    autoIdentify: true,
  }).mount();
};

initBrowser();
