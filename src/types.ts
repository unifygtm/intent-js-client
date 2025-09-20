/// <reference types="user-agent-data-types" />

import { IdentityManager, SessionManager } from './client/managers';
import UnifyApiClient from './client/unify-api-client';
import { components } from './spec';

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
   * The amount of time in minutes that user sessions will persist even when
   * no activities are tracked for the user. Activities which update the
   * expiration time of sessions are `page`, `identify`, and `track` activities.
   * @default 30
   */
  sessionDurationMinutes?: number;
}

export interface UnifyIntentContext {
  writeKey: string;
  clientConfig: UnifyIntentClientConfig;
  apiClient: UnifyApiClient;
  sessionManager: SessionManager;
  identityManager: IdentityManager;
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

// Export types from the OpenAPI spec
export type ActivityContext = components['schemas']['ActivityContext'];
export type AnalyticsEventType = components['schemas']['AnalyticsEventType'];
export type AnalyticsEventBase = components['schemas']['AnalyticsEventBase'];
export type CampaignParams = components['schemas']['CampaignParams'];
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
export type PageProperties = components['schemas']['PageProperties'];
export type Traits = components['schemas']['Traits'];
export type UCountryCode = components['schemas']['UCountryCode'];
