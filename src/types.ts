/// <reference types="user-agent-data-types" />

import { IdentityManager, SessionManager } from './client/managers';
import UnifyApiClient from './client/unify-api-client';
import { components } from './spec';

/**
 * Configuration options for the Unify Intent Client.
 */
export interface UnifyIntentClientConfig {
  /**
   * This option can be specified to indicate that the Unify client
   * should automatically log page events when the current page changes.
   * @default true
   */
  autoPage?: boolean;

  /**
   * This option can be specified to indicate that the Unify client
   * should instantiate an agent which automatically collects user
   * email inputs, contact form submissions, etc.
   * @default false
   */
  autoIdentify?: boolean;

  /**
   * These options can be specified to indicate that the Unify client
   * should instantiate an agent which listens for common user actions
   * such as button clicks and fires track events for these actions
   * automatically.
   * @default undefined
   */
  autoTrackOptions?: AutoTrackOptions;

  /**
   * The amount of time in minutes that user sessions will persist even when
   * no activities are tracked for the user. Activities which update the
   * expiration time of sessions are `page`, `identify`, and `track` activities.
   * @default 30
   */
  sessionDurationMinutes?: number;
}

/**
 * Shared context used in many parts of the Unify Intent Client.
 */
export interface UnifyIntentContext {
  writeKey: string;
  clientConfig: UnifyIntentClientConfig;
  apiClient: UnifyApiClient;
  sessionManager: SessionManager;
  identityManager: IdentityManager;
}

export type TrackingSelectorOptions = {
  /**
   * CSS selector used to identify the element to be tracked.
   */
  selector: string;

  /**
   * Optional - the name of the track event to fire when the user interaction
   * with the element is auto-tracked.
   */
  eventName?: string;
};

/**
 * Options which can be used to automatically track common user actions,
 * e.g. button clicks.
 */
export interface AutoTrackOptions {
  /**
   * An optional list of CSS selectors which can be used to automatically
   * track click events for elements on the page which match one or more
   * of the selectors.
   */
  clickTrackingSelectors?: (string | TrackingSelectorOptions)[];

  /**
   * Options to auto-track eligible Navattic product demo events:
   *
   * https://docs.navattic.com/tracking/navattic-js/subscribe-to-events#navattic-events
   *
   * If set to `true`, all eligible events will be auto-tracked. If `undefined` or set to `false`,
   * no events will be auto-tracked.
   *
   * Can also be set to a map from `NavatticTrackEvent` to `boolean` to customize which
   * events are auto-tracked.
   */
  navatticProductDemos?: boolean | Partial<Record<NavatticTrackEvent, boolean>>;

  /**
   * Options to auto-track eligible Default form events:
   *
   * https://docs.default.com/article/google-tag-manager#event-triggers
   *
   * If set to `true`, all eligible events will be auto-tracked. If `undefined` or set to `false`,
   * no events will be auto-tracked.
   *
   * Can also be set to a map from `DefaultTrackEvent` to `boolean` to customize which
   * events are auto-tracked.
   */
  defaultForms?: boolean | Partial<Record<DefaultTrackEvent, boolean>>;
}

/**
 * Standard track event types.
 *
 * TODO: Eventually this will be defined in the API spec.
 */
export enum UnifyStandardTrackEvent {
  ELEMENT_CLICKED = 'Element Clicked',
}

/**
 * Auto-tracked events for Default forms.
 */
export enum DefaultTrackEvent {
  DEFAULT_FORM_COMPLETED = 'Default Form Completed',
  DEFAULT_FORM_PAGE_SUBMITTED = 'Default Form Page Submitted',
  DEFAULT_MEETING_BOOKED = 'Default Meeting Booked',
  DEFAULT_SCHEDULER_CLOSED = 'Default Scheduler Closed',
  DEFAULT_SCHEDULER_DISPLAYED = 'Default Scheduler Displayed',
}

/**
 * Auto-tracked events for Navattic product demos.
 */
export enum NavatticTrackEvent {
  NAVATTIC_DEMO_COMPLETED = 'Navattic Demo Completed',
  NAVATTIC_DEMO_STARTED = 'Navattic Demo Started',
  NAVATTIC_DEMO_STEP_VIEWED = 'Navattic Demo Step Viewed',
}

/**
 * Options which can be used when logging a page event via the intent client.
 */
export interface PageEventOptions {
  /**
   * Optional pathname to use in place of the current pathname,
   * e.g. "/some-custom-page/v1"
   */
  pathname?: string;
}

export type ClientSession = {
  sessionId: string;
  expiration: number;
  startTime: Date;
  initial: PageProperties;
} & UserAgentDataType;

export interface UserAgentDataType {
  userAgent: NavigatorID['userAgent'];
  userAgentData?: NavigatorUAData;
}

/**
 * =====================================================
 * The types below are re-exported from the OpenAPI spec
 * =====================================================
 */

/**
 * Context automatically included with each event fired by the Unify Intent Client.
 */
export type ActivityContext = components['schemas']['EventContext'];

export type PageProperties = components['schemas']['PageProperties'];
export type CampaignParams = components['schemas']['CampaignParams'];

/**
 * Event types supported by the Unify Intent Client.
 */
export type AnalyticsEventType = components['schemas']['AnalyticsEventType'];

export type AnalyticsEventBase = components['schemas']['AnalyticsEventBase'];

export type IdentifyEvent = components['schemas']['IdentifyEvent'];
export type IdentifyEventData = Omit<
  components['schemas']['IdentifyEvent'],
  keyof Omit<AnalyticsEventBase, 'type'>
>;

export type PageEvent = components['schemas']['PageEvent'];
export type PageEventData = Omit<
  components['schemas']['PageEvent'],
  keyof Omit<AnalyticsEventBase, 'type'>
>;

export type TrackEvent = components['schemas']['TrackEvent'];
export type TrackEventData = Omit<
  components['schemas']['TrackEvent'],
  keyof Omit<AnalyticsEventBase, 'type'>
>;
export type TrackEventProperties = Pick<TrackEventData, 'properties'>;

export type UCompany =
  components['schemas']['CreateOrUpdateUCompanyAttributes'];
export type UPerson = components['schemas']['CreateOrUpdateUPersonAttributes'];

export type UAddress = components['schemas']['UValues.UAddress'];
export type UBoolean = components['schemas']['UValues.UBoolean'];
export type UCountry = components['schemas']['UValues.UCountry'];
export type UCountryCode = components['schemas']['UValues.UCountryCode'];
export type UCurrency = components['schemas']['UValues.UCurrency'];
export type UCurrencyCode = components['schemas']['UValues.UCurrencyCode'];
export type UDate = components['schemas']['UValues.UDate'];
export type UEmail = components['schemas']['UValues.UEmail'];
export type UInteger = components['schemas']['UValues.UInteger'];
export type UPhoneNumber = components['schemas']['UValues.UPhoneNumber'];
export type UReference = components['schemas']['UValues.UReference'];
export type UText = components['schemas']['UValues.UPhoneNumber'];
export type UUrl = components['schemas']['UValues.UUrl'];
