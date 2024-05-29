import { UnifyIntentContext } from 'types';

import { IdentifyActivity, PageActivity } from './activities';
import { validateEmail } from './utils/helpers';

/**
 * This class acts as an agent to automatically monitor user
 * intent-related activity and log relevant events and data to Unify.
 */
class UnifyIntentAgent {
  private readonly _intentContext: UnifyIntentContext;
  private readonly _monitoredInputs: Set<HTMLInputElement>;
  private readonly _submittedEmails: Set<string>;

  private _autoPage: boolean;
  private _autoIdentify: boolean;
  private _historyMonitored: boolean;

  constructor(intentContext: UnifyIntentContext) {
    this._intentContext = intentContext;
    this._monitoredInputs = new Set<HTMLInputElement>();
    this._submittedEmails = new Set<string>();
    this._autoPage = intentContext.clientConfig.autoPage ?? false;
    this._autoIdentify = intentContext.clientConfig.autoIdentify ?? false;
    this._historyMonitored = false;

    // If auto-page is configured, make sure to track the initial page
    if (this._autoPage) {
      this.startAutoPage();
      this.maybeTrackPage();
    }

    if (this._autoIdentify) {
      this.startAutoIdentify();
    }
  }

  /**
   * Tells the Unify Intent Agent to trigger page events when the
   * user's current page changes. Note that this will NOT trigger
   */
  public startAutoPage = () => {
    // We don't start monitoring history until auto-page is turned on
    // for the first time.
    if (!this._historyMonitored) {
      this.monitorHistory();
    }

    this._autoPage = true;
  };

  /**
   * Tells the Unify Intent Agent to NOT trigger page events when the
   * user's current page changes.
   */
  public stopAutoPage = () => {
    this._autoPage = false;
  };

  /**
   * Tells the Unify Intent Agent to continuously monitor identity-related
   * input elements for changes, and automatically submit identify actions
   * to Unify when the user self-identifies.
   */
  public startAutoIdentify = () => {
    this._autoIdentify = true;
    this.refreshMonitoredInputs();
    setInterval(this.refreshMonitoredInputs, 2000);
  };

  /**
   * Tells the Unify Intent Agent to stop continously monitoring inputs
   * for changes.
   */
  public stopAutoIdentify = () => {
    this._monitoredInputs.forEach((input) => {
      if (input.isConnected) {
        input.removeEventListener('blur', this.handleInputBlur);
        input.removeEventListener('keydown', this.handleInputKeydown);
      }
    });
    this._monitoredInputs.clear();
    this._autoIdentify = false;
  };

  /**
   * This function adds event listeners and overrides to various
   * history-related browser functions to automatically track when the
   * current page changes. This is important for tracking page changes
   * in single page apps because the Unify Intent Client will only
   * be instantiated a single time.
   */
  private monitorHistory = () => {
    // `pushState` is usually triggered to navigate to a new page
    const pushState = history.pushState;
    history.pushState = (...args) => {
      pushState.apply(history, args);
      this.maybeTrackPage();
    };

    // Sometimes `replaceState` is used to navigate to a new page, but
    // sometimes it is used to e.g. update query params
    const replaceState = history.replaceState;
    history.replaceState = (...args) => {
      // Get location before history changes
      const oldLocation = { ...window.location };

      // Update history
      replaceState.apply(history, args);

      // Compare old location to new location and maybe track page event
      if (isNewPage(oldLocation, window.location)) {
        this.maybeTrackPage();
      }
    };

    // `popstate` is triggered when the user clicks the back button
    window.addEventListener('popstate', () => {
      this.maybeTrackPage();
    });

    this._historyMonitored = true;
  };

  /**
   * Triggers a page event for the current page and context if auto-page
   * is currently set to `true`.
   */
  private maybeTrackPage = () => {
    if (this._autoPage) {
      new PageActivity(this._intentContext).track();
    }
  };

  /**
   * Discards inputs no longer in the DOM and adds new inputs in the DOM
   * to the set of monitored inputs if they qualify for auto-identity.
   */
  private refreshMonitoredInputs = () => {
    if (!this._autoIdentify) return;

    // Discard input elements no longer in the DOM
    this._monitoredInputs.forEach((input) => {
      if (!input.isConnected) {
        this._monitoredInputs.delete(input);
      }
    });

    // Get all candidate input elements
    const inputs = Array.from(document.getElementsByTagName('input')).filter(
      (input) =>
        !this._monitoredInputs.has(input) && isCandidateIdentityInput(input),
    );

    // Setup event listeners to monitor the input elements
    inputs.forEach((input) => {
      input.addEventListener('blur', this.handleInputBlur);
      input.addEventListener('keydown', this.handleInputKeydown);
      this._monitoredInputs.add(input);
    });
  };

  /**
   * Blur event handler for a monitored input element.
   *
   * @param event - the relevant event to handle
   */
  private handleInputBlur = (event: FocusEvent) => {
    if (!this._autoIdentify) return;
    this.maybeIdentifyInputEmail(event);
  };

  /**
   * Keydown event handler for a monitored input element. Only actions
   * on the 'Enter' key.
   *
   * @param event - the relevant event to handle
   */
  private handleInputKeydown = (event: KeyboardEvent) => {
    if (!this._autoIdentify) return;
    if (event.key === 'Enter') {
      this.maybeIdentifyInputEmail(event);
    }
  };

  /**
   * This function checks if the current value of a monitored input is a valid
   * email address and logs an identity action if it has not already been logged.
   *
   * @param event - the event object from a monitored input blur or keydown event
   */
  private maybeIdentifyInputEmail = (event: KeyboardEvent | FocusEvent) => {
    if (!this._autoIdentify) return;

    if (!(event.target instanceof HTMLInputElement)) {
      return;
    }

    const email = event.target?.value;

    if (email) {
      // Validate that the input is a valid email address and has not already
      // been submitted for an identify action.
      if (!validateEmail(email) || this._submittedEmails.has(email)) {
        return;
      }

      // Log an identify event
      const identifyAction = new IdentifyActivity(this._intentContext, {
        email,
      });
      identifyAction.track();

      // Make sure we don't auto-identify this email again later
      this._submittedEmails.add(email);
    }
  };

  /**
   * DO NOT USE: These methods are exposed only for testing purposes.
   */
  __getMonitoredInputs = () => this._monitoredInputs;
  /**
   * DO NOT USE: These methods are exposed only for testing purposes.
   */
  __getSubmittedEmails = () => this._submittedEmails;
}

/**
 * Sometimes `history.replaceState` is called to manipulate the current URL,
 * but not in a way which qualifies the new URL as a "new page". For example,
 * `history.replaceState` is often used to update query params. When this
 * happens, we do not want to auto-trigger a page event.
 *
 * This function compares two URLs to determine whether the second URL
 * constitutes a "new page" to auto-trigger a page event.
 */
function isNewPage(oldLocation: Location, newLocation: Location): boolean {
  return (
    oldLocation.hostname !== newLocation.hostname ||
    oldLocation.pathname !== newLocation.pathname
  );
}

/**
 * Helper function to filter input elements to those which qualify for
 * auto-identity.
 *
 * @param element - the element to check
 * @returns `true` if this is an input we can get identity from,
 *          otherwise `false`
 */
function isCandidateIdentityInput(element: HTMLInputElement) {
  return element.type === 'email' || element.type === 'text';
}

export default UnifyIntentAgent;
