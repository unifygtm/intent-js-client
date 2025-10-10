import { AutoTrackOptions } from '../types';

export const UNIFY_INTENT_V1_URL = 'https://api.unifyintent.com/analytics/v1';

export const DEFAULT_SESSION_MINUTES_TO_EXPIRE = 30;

export const DEFAULT_AUTO_TRACK_OPTIONS: AutoTrackOptions = {
  clickTrackingSelectors: [],
  navatticProductDemo: {
    startFlow: true,
    viewStep: true,
    completeFlow: true,
  },
};
