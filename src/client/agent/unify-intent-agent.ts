import {
  AutoTrackOptions,
  DefaultTrackEvent,
  NavatticTrackEvent,
  UCompany,
  UnifyIntentContext,
  UnifyStandardTrackEvent,
  UPerson,
} from '../../types';
import { IdentifyActivity, PageActivity, TrackActivity } from '../activities';
import { validateEmail } from '../utils/helpers';
import { logUnifyError } from '../utils/logging';
import {
  DEFAULT_EVENT_TYPE_TO_ORIGIN_MAP,
  DEFAULT_FORMS_IFRAME_ORIGIN,
  DEFAULT_SCHEDULER_IFRAME_ORIGIN,
  NAVATTIC_IFRAME_ORIGIN,
  UNIFY_CLICK_EVENT_NAME_DATA_ATTR,
  UNIFY_CLICK_EVENT_NAME_DATA_ATTR_SELECTOR_NAME,
  UNIFY_TRACK_CLICK_DATA_ATTR,
  UNIFY_TRACK_CLICK_DATA_ATTR_SELECTOR_NAME,
} from './constants';
import { DefaultEventData, DefaultEventType } from './types/default';
import {
  NavatticDefaultCustomPropertyName,
  NavatticEventData,
  NavatticEventType,
  NavatticObject,
} from './types/navattic';
import {
  elementHasDataAttr,
  extractUnifyCapturePropertiesFromElement,
  getElementDataAttr,
  getElementLabel,
  isActionableElement,
} from './utils/helpers';
import {
  getUAttributesForNavatticEventData,
  maybeTrackNavatticEvent,
} from './utils/navattic';
import {
  getUAttributesForDefaultEventData,
  maybeTrackDefaultEvent,
} from './utils/default';
import { isDefaultFormEventData } from './utils/default';

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
  private _isSubscribedToThirdPartyMessages: boolean = false;

  /**
   * There is a bug in the Default scheduler which causes some events to
   * fire twice. We use this instance variable to track when an event
   * was _just_ tracked to prevent double-tracking it.
   */
  private _justTrackedDefaultEventType: DefaultEventType | null = null;

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
    this.subscribeToThirdPartyMessages();
  }

  /**
   * Stops all monitoring done by the Unify Intent Agent.
   */
  public unmount = () => {
    this.stopAutoIdentify();
    this.stopAutoPage();
    this.stopAutoTrack();
    this.unsubscribeFromThirdPartyMessages();
  };

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

      // TODO: deprecate this old selector
      const legacyDefaultSelector = `[${UNIFY_TRACK_CLICK_DATA_ATTR_SELECTOR_NAME}]`;

      // Default selector for tracking a custom event
      const defaultSelector = `[${UNIFY_CLICK_EVENT_NAME_DATA_ATTR_SELECTOR_NAME}]`;

      // Optional custom CSS selectors
      const customCssSelectors =
        this._autoTrackOptions.clickTrackingSelectors ?? [];

      // Combine all selectors
      const selectors = [
        legacyDefaultSelector,
        defaultSelector,
        ...customCssSelectors.map((selectorOrOptions) => {
          if (typeof selectorOrOptions === 'string') {
            return selectorOrOptions;
          }

          return selectorOrOptions.selector;
        }),
      ];

      // Find the closest ancestor which matches any selector
      const element = target.closest(selectors.join(', '));
      if (
        !element ||
        !(element instanceof HTMLElement) ||
        !isActionableElement(element)
      )
        return;

      // The event name for the legacy default selector is always `Element Clicked`
      const legacyDefaultMatchEventName = elementHasDataAttr(
        element,
        UNIFY_TRACK_CLICK_DATA_ATTR,
      )
        ? UnifyStandardTrackEvent.ELEMENT_CLICKED
        : null;

      // The new default selector will have a custom event name
      const defaultMatchEventName = getElementDataAttr(
        element,
        UNIFY_CLICK_EVENT_NAME_DATA_ATTR,
      );

      // Get event names for each custom CSS selector which the element matches
      const customMatchEventNames = customCssSelectors.map(
        (selectorOrOptions) => {
          // If the selector is a simple CSS string
          if (typeof selectorOrOptions === 'string') {
            // Do not double-track an element matched by default selector(s) and
            // custom CSS selector without a custom event name.
            if (legacyDefaultMatchEventName || defaultMatchEventName)
              return null;

            // Never a custom event name in this case, use the default
            if (element.matches(selectorOrOptions)) {
              return UnifyStandardTrackEvent.ELEMENT_CLICKED;
            }

            // No match, so no event name to track
            return null;
          }

          // If the selector is an object containing an optional custom event name
          if (element.matches(selectorOrOptions.selector)) {
            // Do not double-track an element matched by default selector(s) and
            // custom CSS selector without a custom event name.
            if (legacyDefaultMatchEventName || defaultMatchEventName) {
              if (!selectorOrOptions.eventName) return null;
            }

            // Use the custom event name if provided, else fall back to the default
            return (
              selectorOrOptions.eventName ??
              UnifyStandardTrackEvent.ELEMENT_CLICKED
            );
          }

          // No match, so no event name to track
          return null;
        },
      );

      // Filter to all eligible event names to track
      const eventNamesToTrack = [
        defaultMatchEventName,
        ...customMatchEventNames,
      ].filter((eventName): eventName is string => !!eventName);

      // Track an event for each eligible name
      eventNamesToTrack.forEach((eventName) => {
        this.maybeTrackClick({ element, eventName });
      });

      // TODO: deprecate legacy tracking
      if (legacyDefaultMatchEventName) {
        this.maybeTrackClick({
          element,
          eventName: legacyDefaultMatchEventName,
          isLegacy: true,
        });
      }
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
    if (!this._isSubscribedToThirdPartyMessages) {
      window.addEventListener('message', this.handleThirdPartyMessage);
    }

    this._isSubscribedToThirdPartyMessages = true;
  };

  /**
   * Removes event listeners setup in `subscribeToThirdPartyMessages`.
   */
  private unsubscribeFromThirdPartyMessages = () => {
    if (this._isSubscribedToThirdPartyMessages) {
      window.removeEventListener('message', this.handleThirdPartyMessage);
    }

    this._isSubscribedToThirdPartyMessages = false;
  };

  /**
   * Handles an event posted to the window via `window.postMessage` by
   * a third-party integration embedded in an iframe, e.g. a Default form.
   *
   * @param event - the event from `window.postMessage`
   */
  private handleThirdPartyMessage = (event: MessageEvent) => {
    let thirdParty: string | undefined;
    try {
      switch (event.origin) {
        case DEFAULT_FORMS_IFRAME_ORIGIN:
        case DEFAULT_SCHEDULER_IFRAME_ORIGIN: {
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
      this.logError(
        `Error occurred in handleThirdPartyMessage for third-party ${thirdParty}`,
        error,
      );
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
    try {
      // Default will emit some events with JSON string data, we can safely ignore these.
      if (typeof event.data === 'string') return;

      // Some events are emitted by both the Default form AND scheduler iframes.
      // We add this check so that they are not processed more than once.
      if (event.origin !== DEFAULT_EVENT_TYPE_TO_ORIGIN_MAP[event.data.event]) {
        return;
      }

      if (this._autoIdentify && isDefaultFormEventData(event.data)) {
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

      // Optionally auto-track eligible events from Default form/scheduler
      if (this._autoTrackOptions.defaultForms) {
        // Prevent double-tracking
        if (event.data.event === this._justTrackedDefaultEventType) {
          return;
        }

        const trackedEvent = maybeTrackDefaultEvent({
          data: event.data,
          autoTrackOptions: this._autoTrackOptions,
          intentContext: this._intentContext,
        });

        if (trackedEvent) {
          this._justTrackedDefaultEventType = event.data.event;
          setTimeout(() => {
            this._justTrackedDefaultEventType = null;
          }, 500);
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
    try {
      // Optionally auto-identify user from Navattic demo
      if (this._autoIdentify) {
        const eventDataProperties = event.data?.properties ?? [];
        const email = eventDataProperties.find(
          ({ object, name }) =>
            object === NavatticObject.END_USER &&
            name === NavatticDefaultCustomPropertyName.Email,
        );

        if (email?.value) {
          this.maybeIdentifyInputEmail(
            email.value,
            getUAttributesForNavatticEventData(
              event.data,
              this._intentContext.apiClient,
            ),
          );
        }
      }

      // Optionally auto-track eligible events from Navattic demo
      if (this._autoTrackOptions.navatticProductDemos) {
        maybeTrackNavatticEvent({
          data: event.data,
          autoTrackOptions: this._autoTrackOptions,
          intentContext: this._intentContext,
        });
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

  private maybeTrackClick = ({
    element,
    eventName,
    isLegacy = false,
  }: {
    element: HTMLElement;
    eventName: string;
    isLegacy?: boolean;
  }) => {
    try {
      const elementLabel = getElementLabel(element);
      if (!elementLabel) return;

      const customProperties =
        extractUnifyCapturePropertiesFromElement(element);

      const trackActivity = new TrackActivity(this._intentContext, {
        name: eventName,
        properties: {
          ...customProperties,
          label: elementLabel,

          // TODO: deprecate `elementName` when no longer needed
          ...(isLegacy && { elementName: elementLabel }),

          wasAutoTracked: true,
        },
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
