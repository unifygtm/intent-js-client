import { UnifyIntentClientConfig } from '../types';
export declare const DEFAULT_UNIFY_INTENT_CLIENT_CONFIG: UnifyIntentClientConfig;
/**
 * This class is used to leverage the Unify Intent API to log user
 * analytics like page views, sessions, identity, and actions.
 */
export default class UnifyIntentClient {
    private readonly _context;
    private _intentAgent?;
    constructor(writeKey: string, config?: UnifyIntentClientConfig);
    /**
     * This function logs a page view for the current page to
     * the Unify Intent API.
     */
    page: () => void;
    /**
     * This function logs an identify event for the given email address
     * to the Unify Intent API. Unify will associate this email address
     * with the current user's session and all related activities.
     *
     * @param email - the email address to log an identify event for
     * @returns `true` if the email was valid and logged, otherwise `false`
     */
    identify: (email: string) => boolean;
    /**
     * This function will instantiate an agent which continuously monitors
     * page changes to automatically log page events.
     *
     * The corresponding `stopAutoPage` can be used to temporarily
     * stop the continuous monitoring.
     */
    startAutoPage: () => void;
    /**
     * If continuous page monitoring was previously triggered, this function
     * is used to halt the monitoring.
     *
     * The corresponding `startAutoPage` can be used to start it again.
     */
    stopAutoPage: () => void;
    /**
     * This function will instantiate an agent which continuously monitors
     * input elements on the page to automatically log user self-identification.
     *
     * The corresponding `stopAutoIdentify` can be used to temporarily
     * stop the continuous monitoring.
     */
    startAutoIdentify: () => void;
    /**
     * If continuous input monitoring was previously triggered, this function
     * is used to halt the monitoring.
     *
     * The corresponding `startAutoIdentify` can be used to start it again.
     */
    stopAutoIdentify: () => void;
}
//# sourceMappingURL=unify-intent-client.d.ts.map