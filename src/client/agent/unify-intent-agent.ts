import {
  AutoTrackOptions,
  UCompany,
  UnifyIntentContext,
  UnifyStandardTrackEvent,
  UPerson,
} from '../../types';
import { IdentifyActivity, PageActivity, TrackActivity } from '../activities';
import { validateEmail } from '../utils/helpers';
import { logUnifyError } from '../utils/logging';
import {
  DEFAULT_FORMS_IFRAME_ORIGIN,
  NAVATTIC_IFRAME_ORIGIN,
  UNIFY_TRACK_CLICK_DATA_ATTR_SELECTOR_NAME,
} from './constants';
import { DefaultEventData } from './types/default';
import {
  NavatticDefaultCustomPropertyName,
  NavatticEventData,
  NavatticObject,
} from './types/navattic';
import {
  extractUnifyCapturePropertiesFromElement,
  getElementName,
  getUAttributesForDefaultEventData,
  getUAttributesForNavatticEventData,
  isActionableElement,
  isDefaultFormEventData,
} from './utils';

/**
 * This class acts as an agent to automatically monitor user
 * intent-related activity and log relevant events and data to Unify.
 */
export class UnifyIntentAgent {
  private readonly _intentContext: UnifyIntentContext;
  private readonly _monitoredInputs: Set<HTMLInputElement> =
    new Set<HTMLInputElement>();
  private readonly _submittedEmails: Set<string> = new Set<string>();

  private _autoPage: boolean;
  private _autoIdentify: boolean;
  private _autoTrackOptions: AutoTrackOptions;

  private _historyMonitored: boolean = false;
  private _lastLocation?: Location;

  private _isTrackingClicks: boolean = false;

  constructor(intentContext: UnifyIntentContext) {
    this._intentContext = intentContext;

    this._autoPage = intentContext.clientConfig.autoPage ?? false;
    this._autoIdentify = intentContext.clientConfig.autoIdentify ?? false;
    this._autoTrackOptions = { ...intentContext.clientConfig.autoTrackOptions };

    if (this._autoPage) {
      this.startAutoPage();

      // Make sure to track the initial page
      this.maybeTrackPage();
    }

    if (this._autoIdentify) {
      this.startAutoIdentify();
    }

    this.startAutoTrack();
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
    if (this._historyMonitored) {
      window.removeEventListener('popstate', this.maybeTrackPage);
    }

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

    this.subscribeToThirdPartyMessages();
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

    this.unsubscribeFromThirdPartyMessages();

    this._autoIdentify = false;
  };

  /**
   * Tells the Unify Intent Agent to start continuously tracking user actions
   * based on the `AutoTrackOptions` in the client config.
   *
   * @param options - auto-track options to use. If `undefined`, the previously
   *        specified auto-track options will be re-used.
   */
  public startAutoTrack = (options?: AutoTrackOptions) => {
    if (options) {
      this._autoTrackOptions = options;
    }

    this.startTrackingClicks();
  };

  /**
   * Tells the Unify Intent Agent to stop continuously monitoring user actions.
   */
  public stopAutoTrack = () => {
    this.stopTrackingClicks();
  };

  /**
   * This function adds event listeners and overrides to various
   * history-related browser functions to automatically track when the
   * current page changes. This is important for tracking page changes
   * in single page apps because the Unify Intent Client will only
   * be instantiated a single time.
   */
  private monitorHistory = () => {
    try {
      // `pushState` is usually triggered to navigate to a new page
      const pushState = history.pushState;
      history.pushState = (...args) => {
        // Update history
        pushState.apply(history, args);

        // Track page if valid page change
        this.maybeTrackPage();
      };

      // Sometimes `replaceState` is used to navigate to a new page, but
      // sometimes it is used to e.g. update query params
      const replaceState = history.replaceState;
      history.replaceState = (...args) => {
        // Update history
        replaceState.apply(history, args);

        // Track page if valid page change
        this.maybeTrackPage();
      };

      // `popstate` is triggered when the user clicks the back button
      window.addEventListener('popstate', this.maybeTrackPage);

      this._historyMonitored = true;
    } catch (error: unknown) {
      this.logError('Error occurred in monitorHistory', error);
    }
  };

  /**
   * Triggers a page event for the current page and context if auto-page
   * is currently set to `true` and the page has actually changed.
   */
  private maybeTrackPage = () => {
    if (!this._autoPage) return;

    try {
      if (
        !this._lastLocation ||
        isNewPage(this._lastLocation, window.location)
      ) {
        new PageActivity(this._intentContext).track();
        this._lastLocation = { ...window.location };
      }
    } catch (error: unknown) {
      this.logError('Error occurred in maybeTrackPage', error);
    }
  };

  /**
   * Listens for click events in the Document and tracks them if they occurred
   * within an actionable button with a qualified label.
   */
  private startTrackingClicks = () => {
    if (this._isTrackingClicks) return;

    document.addEventListener('click', this.handleDocumentClick);

    this._isTrackingClicks = true;
  };

  /**
   * Stops tracking click events in the document if the intent client is
   * currently tracking them.
   */
  private stopTrackingClicks = () => {
    if (!this._isTrackingClicks) return;

    document.removeEventListener('click', this.handleDocumentClick);

    this._isTrackingClicks = false;
  };

  /**
   * Document click handler function which implements auto-tracking of clicks
   * on relevant elements. By default, will log track clicks with the
   * click-tracking data attributes, but will also include elements that match
   * the click-tracking CSS selectors if specified.
   *
   * @param event - the Document click event
   */
  private handleDocumentClick = (event: MouseEvent) => {
    try {
      const target = event.target as Element | null;
      if (!target) return;

      const selectors = [
        `[${UNIFY_TRACK_CLICK_DATA_ATTR_SELECTOR_NAME}]`,
        ...(this._autoTrackOptions.clickTrackingSelectors ?? []),
      ];

      const element = target.closest(selectors.join(', '));
      if (!element || !(element instanceof HTMLElement)) return;

      this.maybeTrackClick(element);
    } catch (error: unknown) {
      this.logError('Error occurred in handleDocumentClick', error);
    }
  };

  /**
   * Discards inputs no longer in the DOM and adds new inputs in the DOM
   * to the set of monitored inputs if they qualify for auto-identity.
   */
  private refreshMonitoredInputs = () => {
    if (!this._autoIdentify) return;

    try {
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
    } catch (error: unknown) {
      this.logError('Error occurred in refreshMonitoredInputs', error);
    }
  };

  /**
   * Listens for messages posted to the window from third-party
   * integrations which communicate via `window.postMessage`. Sets
   * up event handlers for each supported integration.
   */
  private subscribeToThirdPartyMessages = () => {
    window.addEventListener('message', this.handleThirdPartyMessage);
  };

  /**
   * Removes event listeners setup in `subscribeToThirdPartyMessages`.
   */
  private unsubscribeFromThirdPartyMessages = () => {
    window.removeEventListener('message', this.handleThirdPartyMessage);
  };

  /**
   * Handles an event posted to the window via `window.postMessage` by
   * a third-party integration embedded in an iframe, e.g. a Default form.
   *
   * @param event - the event from `window.postMessage`
   */
  private handleThirdPartyMessage = (event: MessageEvent) => {
    if (!this._autoIdentify) return;

    let thirdParty: string | undefined;
    try {
      switch (event.origin) {
        case DEFAULT_FORMS_IFRAME_ORIGIN: {
          thirdParty = 'Default';
          this.handleDefaultFormMessage(
            event as MessageEvent<DefaultEventData>,
          );
          break;
        }
        case NAVATTIC_IFRAME_ORIGIN: {
          thirdParty = 'Navattic';
          this.handleNavatticDemoMessage(
            event as MessageEvent<NavatticEventData>,
          );
          break;
        }
      }
    } catch (error: unknown) {
      this.logError('Error occurred in handleThirdPartyMessage', error);
    }
  };

  /**
   * Message handler for messages posted from embedded Default forms.
   *
   * @param event - the event from `window.postMessage`
   */
  private handleDefaultFormMessage = (
    event: MessageEvent<DefaultEventData>,
  ) => {
    if (!this._autoIdentify) return;

    try {
      if (isDefaultFormEventData(event.data)) {
        const email = event.data.payload.email;

        if (email) {
          this.maybeIdentifyInputEmail(
            email,
            getUAttributesForDefaultEventData(
              event.data,
              this._intentContext.apiClient,
            ),
          );
        }
      }
    } catch (error: unknown) {
      this.logError('Error occurred in handleDefaultFormMessage', error);
    }
  };

  /**
   * Message handler for messages posted from embedded Navattic demos.
   *
   * @param event - the event from `window.postMessage`
   */
  private handleNavatticDemoMessage = (
    event: MessageEvent<NavatticEventData>,
  ) => {
    if (!this._autoIdentify) return;

    try {
      const eventDataProperties = event.data?.properties ?? [];
      const email = eventDataProperties.find(
        ({ object, name }) =>
          object === NavatticObject.END_USER &&
          name === NavatticDefaultCustomPropertyName.Email,
      );

      if (email) {
        this.maybeIdentifyInputEmail(
          email.value,
          getUAttributesForNavatticEventData(
            event.data,
            this._intentContext.apiClient,
          ),
        );
      }
    } catch (error: unknown) {
      this.logError('Error occurred in handleNavatticDemoMessage', error);
    }
  };

  /**
   * Blur event handler for a monitored input element.
   *
   * @param event - the relevant event to handle
   */
  private handleInputBlur = (event: FocusEvent) => {
    if (!this._autoIdentify) return;

    try {
      if (event.target instanceof HTMLInputElement) {
        this.maybeIdentifyInputEmail(event.target.value);
      }
    } catch (error: unknown) {
      this.logError('Error occurred in handleInputBlur', error);
    }
  };

  /**
   * Keydown event handler for a monitored input element. Only actions
   * on the 'Enter' key.
   *
   * @param event - the relevant event to handle
   */
  private handleInputKeydown = (event: KeyboardEvent) => {
    if (!this._autoIdentify) return;

    try {
      if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
        this.maybeIdentifyInputEmail(event.target.value);
      }
    } catch (error: unknown) {
      this.logError('Error occurred in handleInputKeyDown', error);
    }
  };

  /**
   * This function checks if the current value of a monitored input is a valid
   * email address and logs an identity action if it has not already been logged.
   *
   * @param event - the event object from a monitored input blur or keydown event
   */
  private maybeIdentifyInputEmail = (
    email: string,
    options?: { person?: UPerson; company?: UCompany },
  ) => {
    if (!this._autoIdentify) return;

    try {
      if (email) {
        // Validate that the input is a valid email address and has not already
        // been submitted for an identify action.
        if (!validateEmail(email) || this._submittedEmails.has(email)) {
          return;
        }

        // Log an identify event
        const identifyAction = new IdentifyActivity(this._intentContext, {
          email,
          person: options?.person,
          company: options?.company,
        });
        identifyAction.track();

        // Make sure we don't auto-identify this email again later
        this._submittedEmails.add(email);
      }
    } catch (error: unknown) {
      this.logError('Error occurred in maybeIdentifyInputEmail', error);
    }
  };

  private maybeTrackClick = (element: HTMLElement) => {
    try {
      if (!isActionableElement(element)) return;

      const elementName = getElementName(element);
      if (!elementName) return;

      const customProperties =
        extractUnifyCapturePropertiesFromElement(element);

      const trackActivity = new TrackActivity(this._intentContext, {
        name: UnifyStandardTrackEvent.ELEMENT_CLICKED,
        properties: { ...customProperties, elementName, wasAutoTracked: true },
      });
      trackActivity.track();
    } catch (error: unknown) {
      this.logError('Error occurred in maybeTrackClick', error);
    }
  };

  private logError = (message: string, error: unknown) => {
    logUnifyError({
      message: `UnifyIntentAgent: ${message}`,
      error: error as Error,
      apiClient: this._intentContext.apiClient,
    });
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
