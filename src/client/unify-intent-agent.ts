import { UnifyIntentContext } from 'types';

import { IdentifyActivity } from './activities';
import { validateEmail } from './utils/helpers';

/**
 * This class acts as an agent to automatically monitor user
 * intent-related activity and log relevant events and data to Unify.
 */
class UnifyIntentAgent {
  private readonly _intentContext: UnifyIntentContext;
  private readonly _monitoredInputs: Set<HTMLInputElement>;
  private readonly _submittedEmails: Set<string>;

  private _autoIdentify: boolean;

  constructor(intentContext: UnifyIntentContext) {
    this._intentContext = intentContext;
    this._monitoredInputs = new Set<HTMLInputElement>();
    this._submittedEmails = new Set<string>();
    this._autoIdentify = false;
  }

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
        !this._monitoredInputs.has(input) &&
        this.isCandidateIdentityInput(input),
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
   * Helper function to filter input elements to those which qualify for
   * auto-identity.
   *
   * @param element - the element to check
   * @returns `true` if this is an input we can get identity from,
   *          otherwise `false`
   */
  private isCandidateIdentityInput(element: HTMLInputElement) {
    return element.type === 'email' || element.type === 'text';
  }

  /**
   * DO NOT USE: These methods are exposed only for testing purposes.
   */
  __getMonitoredInputs = () => this._monitoredInputs;
  /**
   * DO NOT USE: These methods are exposed only for testing purposes.
   */
  __getSubmittedEmails = () => this._submittedEmails;
}

export default UnifyIntentAgent;
