import {
  AutoTrackOptions,
  DefaultTrackEvent,
  NavatticTrackEvent,
} from '../types';

export const UNIFY_INTENT_V1_URL = 'https://api.unifyintent.com/analytics/v1';

export const DEFAULT_SESSION_MINUTES_TO_EXPIRE = 30;

export const DEFAULT_AUTO_TRACK_OPTIONS: AutoTrackOptions = {
  clickTrackingSelectors: [],
  navatticProductDemos: {
    [NavatticTrackEvent.NAVATTIC_DEMO_COMPLETED]: true,
    [NavatticTrackEvent.NAVATTIC_DEMO_STARTED]: true,
    [NavatticTrackEvent.NAVATTIC_DEMO_STEP_VIEWED]: true,
  },
  defaultForms: {
    [DefaultTrackEvent.DEFAULT_FORM_COMPLETED]: true,
    [DefaultTrackEvent.DEFAULT_FORM_PAGE_SUBMITTED]: true,
    [DefaultTrackEvent.DEFAULT_MEETING_BOOKED]: true,
    [DefaultTrackEvent.DEFAULT_SCHEDULER_CLOSED]: true,
    [DefaultTrackEvent.DEFAULT_SCHEDULER_DISPLAYED]: true,
  },
};
