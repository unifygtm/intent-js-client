import {
  PageEventOptions,
  UnifyIntentClientConfig,
  UnifyIntentContext,
} from '../types';
import { IdentifyActivity, PageActivity } from './activities';
import { IdentityManager, SessionManager } from './managers';
import UnifyApiClient from './unify-api-client';
import { UnifyIntentAgent } from './agent';
import { isIntentClient, validateEmail } from './utils/helpers';
import { logUnifyError } from './utils/logging';

declare global {
  interface Window {
    unify?: UnifyIntentClient;
    unifyBrowser?: UnifyIntentClient;
  }
}

export const DEFAULT_UNIFY_INTENT_CLIENT_CONFIG: UnifyIntentClientConfig = {
  autoPage: false,
  autoIdentify: false,
};

/**
 * This class is used to leverage the Unify Intent API to log user
 * analytics like page views, sessions, identity, and actions.
 */
export default class UnifyIntentClient {
  private readonly _writeKey: string;
  private readonly _config: UnifyIntentClientConfig;

  private _mounted: boolean = false;
  private _context!: UnifyIntentContext;
  private _intentAgent?: UnifyIntentAgent;

  constructor(
    writeKey: string,
    config: UnifyIntentClientConfig = DEFAULT_UNIFY_INTENT_CLIENT_CONFIG,
  ) {
    this._writeKey = writeKey;
    this._config = config;
  }

  /**
   * This function initializes the `UnifyIntentClient` for use. It should only
   * be called once the global `window` object exists. If using the client in
   * React, for example, this would take place inside a `useEffect` hook.
   */
  public mount = () => {
    // The client should never be initialized outside a global window context
    if (typeof window === 'undefined') return;

    // The client should never be instantiated more than once
    if (isIntentClient(window.unify) || isIntentClient(window.unifyBrowser)) {
      logUnifyError({
        message:
          'UnifyIntentClient already exists on window, a new one will not be created.',
      });
      return;
    }

    // Initialize API client
    const apiClient = new UnifyApiClient(this._writeKey);

    // Initialize user session
    const sessionManager = new SessionManager(this._writeKey);
    sessionManager.getOrCreateSession();

    // Create anonymous user ID if needed
    const identityManager = new IdentityManager(this._writeKey);
    identityManager.getOrCreateAnonymousUserId();

    // Initialize context
    this._context = {
      writeKey: this._writeKey,
      clientConfig: this._config,
      apiClient,
      sessionManager,
      identityManager,
    };

    // Initialize intent agent if specifed by config
    if (this._config.autoPage || this._config.autoIdentify) {
      this._intentAgent = new UnifyIntentAgent(this._context);
    }

    // We set `mounted` to `true` before flushing the queue since the
    // methdods which can be called require that.
    this._mounted = true;

    // When the client is loaded from CDN, it's possible that method
    // calls have been queued on `window.unify`
    flushUnifyQueue(this);

    // Set unify object on window to prevent multiple instantiations
    window.unify = this;
    window.unifyBrowser = this;
  };

  /**
   * This function cleans up this instance of the `UnifyIntentClient` when
   * it should be unmounted from the DOM. If using the client in
   * React, for example, this would take place inside the function returned
   * by the same `useEffect` used to mount the client.
   */
  public unmount = () => {
    // If window no longer exists at this point, there is nothing to unmount
    if (typeof window === 'undefined') return;

    if (this._config.autoPage) {
      this.stopAutoPage();
    }

    if (this._config.autoIdentify) {
      this.stopAutoIdentify();
    }

    this._mounted = false;
    window.unify = undefined;
    window.unifyBrowser = undefined;
  };

  /**
   * This function logs a page view for the current page or the page
   * specified in options to the Unify Intent API.
   *
   * @param options - options which can be used to customize the page
   *        event which is logged. See `PageEventOptions` for details.
   */
  public page = (options?: PageEventOptions) => {
    if (!this._mounted) return;

    const action = new PageActivity(this._context, options);
    action.track();
  };

  /**
   * This function logs an identify event for the given email address
   * to the Unify Intent API. Unify will associate this email address
   * with the current user's session and all related activities.
   *
   * @param email - the email address to log an identify event for
   * @returns `true` if the email was valid and logged, otherwise `false`
   */
  public identify = (email: string): boolean => {
    if (!this._mounted) return false;

    const validatedEmail = validateEmail(email);
    if (validatedEmail) {
      const action = new IdentifyActivity(this._context, {
        email: validatedEmail,
      });
      action.track();

      return true;
    }

    return false;
  };

  /**
   * This function will instantiate an agent which continuously monitors
   * page changes to automatically log page events.
   *
   * The corresponding `stopAutoPage` can be used to temporarily
   * stop the continuous monitoring.
   */
  public startAutoPage = () => {
    if (!this._mounted) return;

    if (!this._intentAgent) {
      this._intentAgent = new UnifyIntentAgent(this._context);
    }

    this._intentAgent.startAutoPage();
  };

  /**
   * If continuous page monitoring was previously triggered, this function
   * is used to halt the monitoring.
   *
   * The corresponding `startAutoPage` can be used to start it again.
   */
  public stopAutoPage = () => {
    if (!this._mounted) return;

    this._intentAgent?.stopAutoPage();
  };

  /**
   * This function will instantiate an agent which continuously monitors
   * input elements on the page to automatically log user self-identification.
   *
   * The corresponding `stopAutoIdentify` can be used to temporarily
   * stop the continuous monitoring.
   */
  public startAutoIdentify = () => {
    if (!this._mounted) return;

    if (!this._intentAgent) {
      this._intentAgent = new UnifyIntentAgent(this._context);
    }

    this._intentAgent.startAutoIdentify();
  };

  /**
   * If continuous input monitoring was previously triggered, this function
   * is used to halt the monitoring.
   *
   * The corresponding `startAutoIdentify` can be used to start it again.
   */
  public stopAutoIdentify = () => {
    if (!this._mounted) return;

    this._intentAgent?.stopAutoIdentify();
  };
}

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
  const queue: [string, unknown[]][] = Array.isArray(window.unify)
    ? [...window.unify]
    : Array.isArray(window.unifyBrowser)
    ? [...window.unifyBrowser]
    : [];

  queue.forEach(([method, args]) => {
    if (typeof unify[method as keyof UnifyIntentClient] === 'function') {
      try {
        if (Array.isArray(args)) {
          // @ts-ignore the type of the args is unknown at this point
          unify[method as keyof UnifyIntentClient].call(unify, ...args);
        } else {
          // @ts-ignore the type of the args is unknown at this point
          unify[method as keyof UnifyIntentClient].call(unify);
        }
      } catch (error: any) {
        // Swallow errors so client is not potentially affected, this
        // should ideally never happen.
        logUnifyError({ message: error?.message });
      }
    }
  });
}
