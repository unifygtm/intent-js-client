import { UnifyIntentContext } from '../types';
/**
 * This class acts as an agent to automatically monitor user
 * intent-related activity and log relevant events and data to Unify.
 */
export default class UnifyIntentAgent {
    private readonly _intentContext;
    private readonly _monitoredInputs;
    private readonly _submittedEmails;
    private _autoPage;
    private _autoIdentify;
    private _historyMonitored;
    constructor(intentContext: UnifyIntentContext);
    /**
     * Tells the Unify Intent Agent to trigger page events when the
     * user's current page changes. Note that this will NOT trigger
     */
    startAutoPage: () => void;
    /**
     * Tells the Unify Intent Agent to NOT trigger page events when the
     * user's current page changes.
     */
    stopAutoPage: () => void;
    /**
     * Tells the Unify Intent Agent to continuously monitor identity-related
     * input elements for changes, and automatically submit identify actions
     * to Unify when the user self-identifies.
     */
    startAutoIdentify: () => void;
    /**
     * Tells the Unify Intent Agent to stop continously monitoring inputs
     * for changes.
     */
    stopAutoIdentify: () => void;
    /**
     * This function adds event listeners and overrides to various
     * history-related browser functions to automatically track when the
     * current page changes. This is important for tracking page changes
     * in single page apps because the Unify Intent Client will only
     * be instantiated a single time.
     */
    private monitorHistory;
    /**
     * Triggers a page event for the current page and context if auto-page
     * is currently set to `true`.
     */
    private maybeTrackPage;
    /**
     * Discards inputs no longer in the DOM and adds new inputs in the DOM
     * to the set of monitored inputs if they qualify for auto-identity.
     */
    private refreshMonitoredInputs;
    /**
     * Blur event handler for a monitored input element.
     *
     * @param event - the relevant event to handle
     */
    private handleInputBlur;
    /**
     * Keydown event handler for a monitored input element. Only actions
     * on the 'Enter' key.
     *
     * @param event - the relevant event to handle
     */
    private handleInputKeydown;
    /**
     * This function checks if the current value of a monitored input is a valid
     * email address and logs an identity action if it has not already been logged.
     *
     * @param event - the event object from a monitored input blur or keydown event
     */
    private maybeIdentifyInputEmail;
    /**
     * DO NOT USE: These methods are exposed only for testing purposes.
     */
    __getMonitoredInputs: () => Set<HTMLInputElement>;
    /**
     * DO NOT USE: These methods are exposed only for testing purposes.
     */
    __getSubmittedEmails: () => Set<string>;
}
//# sourceMappingURL=unify-intent-agent.d.ts.map