import { faker } from '@faker-js/faker';

import type {
  ActivityContext,
  ClientSession,
  PageProperties,
  UserAgentDataType,
} from '../../types';
import {
  DEFAULT_FORMS_IFRAME_ORIGIN,
  DEFAULT_SCHEDULER_IFRAME_ORIGIN,
  NAVATTIC_IFRAME_ORIGIN,
} from '../../client/agent/constants';
import { NavatticEventType } from '../../client/agent/types/navattic';
import { DefaultEventType } from '../../client/agent/types/default';

export const TEST_WRITE_KEY = '1234';
export const TEST_VISITOR_ID = '5678';

export const MockUTM = {
  source: 'google',
  medium: 'cpc',
  campaign: 'campaign',
  term: 'term',
  content: 'content',
};

export const MockQueryParams = {
  utm_source: MockUTM.source,
  utm_medium: MockUTM.medium,
  utm_campaign: MockUTM.campaign,
  utm_term: MockUTM.term,
  utm_content: MockUTM.content,
};

export const MockUrlQuery = `?utm_source=${MockUTM.source}&utm_medium=${MockUTM.medium}&utm_campaign=${MockUTM.campaign}&utm_term=${MockUTM.term}&utm_content=${MockUTM.content}`;

// testEnvironmentOptions set in package.json
export const testEnvironmentOptions = {
  url: `https://www.test.com/${MockUrlQuery}`,
  referrer: 'https://www.refrrer.com/',
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36',
};

export const MockUserAgentData: UserAgentDataType = {
  userAgent: testEnvironmentOptions.userAgent,
  userAgentData: undefined,
};

export const MockClientSession = (
  overrides?: Partial<ClientSession>,
): ClientSession => ({
  sessionId: faker.string.uuid(),
  expiration: faker.number.int(),
  startTime: faker.date.recent(),
  initial: {},
  ...MockUserAgentData,
  ...overrides,
});

export const MockActivityContext: ActivityContext = {
  ...MockUserAgentData,
  locale: 'en-US',
  utm: MockUTM,
};

export const MockPageProperties: PageProperties = {
  path: '/',
  query: MockQueryParams,
  referrer: testEnvironmentOptions.referrer,
  title: '',
  url: testEnvironmentOptions.url,
};

export const getMockDefaultFormPageSubmittedEvent = () => ({
  origin: DEFAULT_FORMS_IFRAME_ORIGIN,
  data: {
    event: DefaultEventType.FORM_PAGE_SUBMITTED,
    payload: {
      email: 'test@test.com',
      formName: 'Form Name',
      formId: 1234,
      pageNumber: 1,
    },
  },
});

export const getMockDefaultFormCompletedEvent = () => ({
  origin: DEFAULT_FORMS_IFRAME_ORIGIN,
  data: {
    event: DefaultEventType.FORM_COMPLETED,
    payload: {
      formName: 'Form Name',
      formId: 1234,
    },
  },
});

export const getMockDefaultFormMeetingBookedEvent = () => ({
  origin: DEFAULT_SCHEDULER_IFRAME_ORIGIN,
  data: {
    event: DefaultEventType.MEETING_BOOKED,
    payload: {
      memberName: 'Shravya Rao',
      memberEmail: 'shravya@unifygtm.com',
      durationInMinutes: 30,
      startDateTime: new Date().toISOString(),
    },
  },
});

export const getMockDefaultFormSchedulerClosedEvent = () => ({
  origin: DEFAULT_FORMS_IFRAME_ORIGIN,
  data: {
    event: DefaultEventType.SCHEDULER_CLOSED,
    payload: {},
  },
});

export const getMockDefaultFormSchedulerDisplayedEvent = () => ({
  origin: DEFAULT_SCHEDULER_IFRAME_ORIGIN,
  data: {
    event: DefaultEventType.SCHEDULER_DISPLAYED,
    payload: {
      email: 'test@test.com',
      formId: 1234,
    },
  },
});

export const getMockNavatticViewStepEvent = () => ({
  origin: NAVATTIC_IFRAME_ORIGIN,
  data: {
    type: NavatticEventType.VIEW_STEP,
    flow: {
      name: 'Product Demo',
    },
    step: {
      name: 'Step 1',
    },
    properties: [],
  },
});

export const getMockNavatticStartFlowEvent = () => ({
  origin: NAVATTIC_IFRAME_ORIGIN,
  data: {
    type: NavatticEventType.START_FLOW,
    flow: {
      name: 'Product Demo',
    },
    properties: [],
  },
});

export const getMockNavatticCompleteFlowEvent = () => ({
  origin: NAVATTIC_IFRAME_ORIGIN,
  data: {
    type: NavatticEventType.COMPLETE_FLOW,
    flow: {
      name: 'Product Demo',
    },
    properties: [],
  },
});
