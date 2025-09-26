/// <reference types="@types/js-cookie" />
/// <reference types="@types/uuid" />
/// <reference types="user-agent-data-types" />

export {
  AnalyticsEventBase,
  AnalyticsEventType,
  AutoTrackOptions,
  IdentifyEventData,
  PageEventData,
  PageEventOptions,
  TrackEventData,
  TrackEventProperties,
  UAddress,
  UBoolean,
  UCompany,
  UCountry,
  UCountryCode,
  UCurrency,
  UCurrencyCode,
  UDate,
  UEmail,
  UInteger,
  UPerson,
  UPhoneNumber,
  UReference,
  UText,
  UUrl,
  UnifyIntentClientConfig,
} from './types';

export { default as UnifyIntentClient } from './client/unify-intent-client';
