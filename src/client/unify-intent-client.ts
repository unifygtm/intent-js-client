import type {
  AnalyticsEventBase,
  AutoTrackOptions,
  PageEventOptions,
  TrackEventData,
  TrackEventProperties,
  UCompany,
  UnifyIntentClientConfig,
  UnifyIntentContext,
  UPerson,
} from '../types';
import { IdentifyActivity, PageActivity, TrackActivity } from './activities';
import { IdentityManager, SessionManager } from './managers';
import UnifyApiClient from './unify-api-client';
import { UnifyIntentAgent } from './agent';
import { isIntentClient, validateEmail } from './utils/helpers';
import { logUnifyError } from './utils/logging';
import { DEFAULT_SESSION_MINUTES_TO_EXPIRE } from './constants';

declare global {
  interface Window {
    unify?: UnifyIntentClient;
    unifyBrowser?: UnifyIntentClient;
  }
}

export const DEFAULT_UNIFY_INTENT_CLIENT_CONFIG: UnifyIntentClientConfig = {
  autoPage: false,
  autoIdentify: false,
  sessionDurationMinutes: DEFAULT_SESSION_MINUTES_TO_EXPIRE,
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

    try {
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
      const sessionManager = new SessionManager(this._writeKey, {
        durationMinutes: this._config.sessionDurationMinutes,
      });
      sessionManager.getOrCreateSession();

      // Create visitor ID if needed
      const identityManager = new IdentityManager(this._writeKey);
      identityManager.getOrCreateVisitorId();

      // Initialize context
      this._context = {
        writeKey: this._writeKey,
        clientConfig: this._config,
        apiClient,
        sessionManager,
        identityManager,
      };

      // Initialize intent agent if specifed by config
      this._intentAgent = new UnifyIntentAgent(this._context);

      // We set `mounted` to `true` before flushing the queue since the
      // methdods which can be called require that.
      this._mounted = true;

      // When the client is loaded from CDN, it's possible that method
      // calls have been queued on `window.unify`
      flushUnifyQueue(this, apiClient);

      // Set unify object on window to prevent multiple instantiations
      window.unify = this;
      window.unifyBrowser = this;
    } catch (error: unknown) {
      this.logError('Error occurred in mount', error);
    }
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

    try {
      if (this._config.autoPage) {
        this.stopAutoPage();
      }

      if (this._config.autoIdentify) {
        this.stopAutoIdentify();
      }

      this.stopAutoTrack();

      this._mounted = false;
      window.unify = undefined;
      window.unifyBrowser = undefined;
    } catch (error: unknown) {
      this.logError('Error occurred in unmount', error);
    }
  };

  /**
   * This function logs a page view for the current page or the page
   * specified in options to the Unify Intent API.
   *
   * @param options - options which can be used to customize the page event which is logged. See `PageEventOptions` for details.
   */
  public page = (options?: PageEventOptions) => {
    if (!this._mounted) return;

    try {
      const action = new PageActivity(this._context, options);
      action.track();
    } catch (error: unknown) {
      this.logError('Error occurred in page', error);
    }
  };

  /**
   * This function returns the request payload for tracking a page event.
   * This is useful if you want to send the payload to a proxy server to
   * perform the tracking server-side.
   *
   * @param options - options which can be used to customize the page event which is tracked. See `PageEventOptions` for details.
   * @returns if the client is mounted, the request payload to track a page event, otherwise returns `undefined`
   */
  public getPagePayload = (options?: PageEventOptions) => {
    if (!this._mounted) return;

    try {
      const action = new PageActivity(this._context, options);
      return action.getTrackPayload();
    } catch (error: unknown) {
      this.logError('Error occurred in getPagePayload', error);
    }
  };

  /**
   * This function logs an identify event for the given email address
   * to the Unify Intent API. Unify will associate this email address
   * with the current user's session and all related activities.
   *
   * @param email - the email address to log an identify event for
   * @param options - object containing Person or Company data to associate with the identified visitor. If the Person or Company already exists in Unify, they will be updated, otherwise they will be created.
   * @returns `true` if the email was valid and logged, otherwise `false`
   */
  public identify = (
    email: string,
    options?: { person?: UPerson; company?: UCompany },
  ): boolean => {
    if (!this._mounted) return false;

    try {
      const validatedEmail = validateEmail(email);
      if (validatedEmail) {
        const action = new IdentifyActivity(this._context, {
          email: validatedEmail,
          person: options?.person,
          company: options?.company,
        });
        action.track();

        return true;
      }
    } catch (error: unknown) {
      this.logError('Error occurred in identify', error);
    }

    return false;
  };

  /**
   * This function returns the request payload for tracking an identify event.
   * This is useful if you want to send the payload to a proxy server to
   * perform the tracking server-side.
   *
   * @param email - the email address to log an identify event for
   * @param options - object containing Person or Company data to associate with the identified visitor. If the Person or Company already exists in Unify, they will be updated, otherwise they will be created.
   * @returns if the client is mounted and `email` is a valid email address, the request payload to track an identify event, otherwise returns `undefined`
   */
  public getIdentifyPayload = (
    email: string,
    options?: { person?: UPerson; company?: UCompany },
  ) => {
    if (!this._mounted) return false;

    try {
      const validatedEmail = validateEmail(email);
      if (validatedEmail) {
        const action = new IdentifyActivity(this._context, {
          email: validatedEmail,
          person: options?.person,
          company: options?.company,
        });
        return action.getTrackPayload();
      }
    } catch (error: unknown) {
      this.logError('Error occurred in getIdentifyPayload', error);
    }
  };

  /**
   * This function logs a track event with the given name and properties
   * to the Unify Intent API. Unify will associate this event
   * with the current user's session and all related activities.
   *
   * @param name - the name of the event to track, e.g. "Demo Button Clicked"
   * @param properties - optional properties to associate with the event
   */
  public track = (name: string, properties?: TrackEventProperties): void => {
    if (!this._mounted) return;

    try {
      const action = new TrackActivity(this._context, { name, properties });
      action.track();
    } catch (error: unknown) {
      this.logError('Error occurred in track', error);
    }
  };

  /**
   * This function returns the request payload for a single track event.
   * This is useful if you want to send the payload to a proxy server to
   * perform the tracking server-side.
   *
   * @param name - the name of the event to track, e.g. "Demo Button Clicked"
   * @param properties - optional properties to associate with the event
   * @returns if the client is mounted, the request payload for a track event, otherwise `undefined`
   */
  public getTrackPayload = (
    name: string,
    properties: TrackEventProperties,
  ): (AnalyticsEventBase & TrackEventData) | undefined => {
    if (!this._mounted) return;

    try {
      const action = new TrackActivity(this._context, { name, properties });
      return action.getTrackPayload();
    } catch (error: unknown) {
      this.logError('Error occurred in getTrackPayload', error);
    }
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

    try {
      if (!this._intentAgent) {
        this._intentAgent = new UnifyIntentAgent(this._context);
      }

      this._intentAgent.startAutoPage();
    } catch (error: unknown) {
      this.logError('Error occurred in startAutoPage', error);
    }
  };

  /**
   * If continuous page monitoring was previously triggered, this function
   * is used to halt the monitoring.
   *
   * The corresponding `startAutoPage` can be used to start it again.
   */
  public stopAutoPage = () => {
    if (!this._mounted) return;

    try {
      this._intentAgent?.stopAutoPage();
    } catch (error: unknown) {
      this.logError('Error occurred in stopAutoPage', error);
    }
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

    try {
      if (!this._intentAgent) {
        this._intentAgent = new UnifyIntentAgent(this._context);
      }

      this._intentAgent.startAutoIdentify();
    } catch (error: unknown) {
      this.logError('Error occurred in startAutoIdentify', error);
    }
  };

  /**
   * If continuous input monitoring was previously triggered, this function
   * is used to halt the monitoring.
   *
   * The corresponding `startAutoIdentify` can be used to start it again.
   */
  public stopAutoIdentify = () => {
    if (!this._mounted) return;

    try {
      this._intentAgent?.stopAutoIdentify();
    } catch (error: unknown) {
      this.logError('Error occurred in stopAutoIdentify', error);
    }
  };

  /**
   * This function will instantiate an agent which continuously monitors
   * user actions on the page to automatically fire track events for them.
   *
   * The corresponding `stopAutoTrack` can be used to temporarily
   * stop the continuous monitoring.
   *
   * @param options - auto-track options to use. If `undefined`, the previously
   *        specified auto-track options will be re-used.
   */
  public startAutoTrack = (options?: AutoTrackOptions) => {
    if (!this._mounted) return;

    try {
      if (options) {
        this._config.autoTrackOptions = options;
      }

      if (!this._intentAgent) {
        this._intentAgent = new UnifyIntentAgent(this._context);
      }

      this._intentAgent.startAutoTrack(options);
    } catch (error: unknown) {
      this.logError('Error occurred in startAutoTrack', error);
    }
  };

  /**
   * If continuous user action monitoring was previously enabled, this function
   * is used to halt the monitoring.
   *
   * The corresponding `startAutoTrack` can be used to start it again.
   */
  public stopAutoTrack = () => {
    if (!this._mounted) return;

    try {
      this._intentAgent?.stopAutoTrack();
    } catch (error: unknown) {
      this.logError('Error occurred in stopAutoTrack', error);
    }
  };

  private logError = (message: string, error: unknown) => {
    logUnifyError({
      message: `UnifyIntentClient: ${message}`,
      error: error as Error,
      apiClient: this._context.apiClient,
    });
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
function flushUnifyQueue(unify: UnifyIntentClient, apiClient: UnifyApiClient) {
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
        logUnifyError({
          message: `Error occurred while flushing queue: ${error?.message}`,
          error: error as Error,
          apiClient,
        });
      }
    }
  });
}
