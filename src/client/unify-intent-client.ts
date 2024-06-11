import { UnifyIntentClientConfig, UnifyIntentContext } from '../types';
import { IdentifyActivity, PageActivity } from './activities';
import { IdentityManager, SessionManager } from './managers';
import UnifyApiClient from './unify-api-client';
import { UnifyIntentAgent } from './agent';
import { validateEmail } from './utils/helpers';
import { logUnifyError } from './utils/logging';

declare global {
  interface Window {
    unify?: UnifyIntentClient;
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
  private readonly _context!: UnifyIntentContext;

  private _intentAgent?: UnifyIntentAgent;

  constructor(
    writeKey: string,
    config: UnifyIntentClientConfig = DEFAULT_UNIFY_INTENT_CLIENT_CONFIG,
  ) {
    // The client should never be initialized outside a global window context
    if (typeof window === 'undefined') return;

    // The client should never be instantiated more than once
    if (window.unify !== undefined && !Array.isArray(window.unify)) {
      logUnifyError({
        message:
          'UnifyIntentClient already exists on window, a new one will not be created.',
      });
      return;
    }

    // Initialize API client
    const apiClient = new UnifyApiClient(writeKey);

    // Initialize user session
    const sessionManager = new SessionManager(writeKey);
    sessionManager.getOrCreateSession();

    // Create anonymous user ID if needed
    const identityManager = new IdentityManager(writeKey);
    identityManager.getOrCreateAnonymousUserId();

    // Initialize context
    this._context = {
      writeKey,
      clientConfig: config,
      apiClient,
      sessionManager,
      identityManager,
    };

    // Initialize intent agent if specifed by config
    if (config.autoPage || config.autoIdentify) {
      this._intentAgent = new UnifyIntentAgent(this._context);
    }

    // When the client is loaded from CDN, it's possible that method
    // calls have been queued on `window.unify`
    flushUnifyQueue(this);

    // Set unify object on window to prevent multiple instantiations
    window.unify = this;
  }

  /**
   * This function logs a page view for the current page to
   * the Unify Intent API.
   */
  public page = () => {
    const action = new PageActivity(this._context);
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
    : [];

  queue.forEach(([method, args]) => {
    if (typeof unify[method as keyof UnifyIntentClient] === 'function') {
      try {
        // @ts-expect-error the type of the args is unknown at this point
        unify[method as keyof UnifyIntentClient].call(unify, ...args);
      } catch (error: any) {
        // Swallow errors so client is not potentially affected, this
        // should ideally never happen.
        logUnifyError({ message: error?.message });
      }
    }
  });
}
