import { validateEmail } from './utils/helpers';
import { IdentifyActivity, PageActivity } from './activities';
import { IdentityManager, SessionManager } from './managers';
import { UnifyIntentClientConfig, UnifyIntentContext } from './types';
import UnifyApiClient from './unify-api-client';
import UnifyIntentAgent from './unify-intent-agent';

export const DEFAULT_UNIFY_INTENT_CLIENT_CONFIG: UnifyIntentClientConfig = {
  autoIdentify: false,
};

/**
 * This class is used to leverage the Unify Intent API to log user
 * analytics like page views, sessions, identity, and actions.
 */
class UnifyIntentClient {
  private readonly _context: UnifyIntentContext;

  private _intentAgent?: UnifyIntentAgent;

  constructor(
    writeKey: string,
    config: UnifyIntentClientConfig = DEFAULT_UNIFY_INTENT_CLIENT_CONFIG
  ) {
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
      writeKey: writeKey,
      clientConfig: config,
      apiClient,
      sessionManager,
      identityManager,
    };

    // Initialize intent agent if specifed by config
    if (config.autoIdentify) {
      this._intentAgent = new UnifyIntentAgent(this._context);
      this._intentAgent.startAutoIdentify();
    }
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

export default UnifyIntentClient;
