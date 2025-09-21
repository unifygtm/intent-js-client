import { mock, mockReset } from 'jest-mock-extended';

import { UnifyIntentClient } from '../../client';
import {
  IdentifyActivity,
  PageActivity,
  TrackActivity,
} from '../../client/activities';
import { IdentityManager, SessionManager } from '../../client/managers';
import { UnifyIntentAgent } from '../../client/agent';
import { TEST_WRITE_KEY } from '../mocks/data';
import { isIntentClient } from '../../client/utils/helpers';

const mockedIdentityManager = mock(IdentityManager.prototype);
const mockedSessionManager = mock(SessionManager.prototype);
jest.mock('../../client/managers', () => ({
  ...jest.requireActual('../../client/managers'),
  IdentityManager: jest.fn().mockImplementation(() => mockedIdentityManager),
  SessionManager: jest.fn().mockImplementation(() => mockedSessionManager),
}));

const mockedIntentAgent = mock(UnifyIntentAgent.prototype);
jest.mock('../../client/agent', () => ({
  ...jest.requireActual('../../client/agent'),
  __esModule: true,
  UnifyIntentAgent: jest.fn().mockImplementation(() => mockedIntentAgent),
}));

const mockedIdentifyActivity = mock(IdentifyActivity.prototype);
const mockedPageActivity = mock(PageActivity.prototype);
const mockedTrackActivity = mock(TrackActivity.prototype);
jest.mock('../../client/activities', () => ({
  ...jest.requireActual('../../client/activities'),
  IdentifyActivity: jest.fn().mockImplementation(() => mockedIdentifyActivity),
  PageActivity: jest.fn().mockImplementation(() => mockedPageActivity),
  TrackActivity: jest.fn().mockImplementation(() => mockedTrackActivity),
}));

describe('UnifyIntentClient', () => {
  beforeEach(() => {
    window.unify = undefined;
    window.unifyBrowser = undefined;
    mockReset(mockedIdentityManager);
    mockReset(mockedSessionManager);
    mockReset(mockedIntentAgent);
    mockReset(mockedPageActivity);
    mockReset(mockedIdentifyActivity);
    mockReset(mockedTrackActivity);
  });

  it('clears methods in the queue', () => {
    // @ts-ignore
    window.unify = [
      ['page', []],
      ['identify', ['solomon@unifygtm.com']],
      ['track', ['Button clicked']],
    ];
    const unify = new UnifyIntentClient(TEST_WRITE_KEY);
    unify.mount();

    expect(mockedPageActivity.track).toHaveBeenCalledTimes(1);
    expect(mockedIdentifyActivity.track).toHaveBeenCalledTimes(1);
    expect(mockedTrackActivity.track).toHaveBeenCalledTimes(1);

    expect(isIntentClient(window.unify)).toBeTruthy();
    expect(isIntentClient(window.unifyBrowser)).toBeTruthy();

    unify.unmount();
  });

  it('clears methods in the queue when window.unifyBrowser is initialized', () => {
    window.unify = undefined;
    // @ts-ignore
    window.unifyBrowser = [
      ['page', []],
      ['identify', ['solomon@unifygtm.com']],
      ['track', ['Button clicked', { property: 'test' }]],
    ];
    const unify = new UnifyIntentClient(TEST_WRITE_KEY);
    unify.mount();

    expect(mockedPageActivity.track).toHaveBeenCalledTimes(1);
    expect(mockedIdentifyActivity.track).toHaveBeenCalledTimes(1);
    expect(mockedTrackActivity.track).toHaveBeenCalledTimes(1);

    expect(isIntentClient(window.unify)).toBeTruthy();
    expect(isIntentClient(window.unifyBrowser)).toBeTruthy();

    unify.unmount();
  });

  it('initializes a visitor ID and client session', () => {
    const unify = new UnifyIntentClient(TEST_WRITE_KEY);
    unify.mount();

    expect(mockedIdentityManager.getOrCreateVisitorId).toHaveBeenCalledTimes(1);
    expect(mockedSessionManager.getOrCreateSession).toHaveBeenCalledTimes(1);

    unify.unmount();
  });

  describe('page', () => {
    it('creates a new PageActivity and tracks it', () => {
      const unify = new UnifyIntentClient(TEST_WRITE_KEY, { autoPage: false });
      unify.mount();

      expect(mockedPageActivity.track).not.toHaveBeenCalled();
      unify.page();
      expect(mockedPageActivity.track).toHaveBeenCalledTimes(1);

      unify.unmount();
    });
  });

  describe('identify', () => {
    it('creates a new IdentifyActivity and tracks it when valid', () => {
      const unify = new UnifyIntentClient(TEST_WRITE_KEY);
      unify.mount();

      unify.identify('solomon@unifygtm.com');
      expect(mockedIdentifyActivity.track).toHaveBeenCalledTimes(1);

      unify.unmount();
    });

    it('does nothing when the email argument is invalid', () => {
      const unify = new UnifyIntentClient(TEST_WRITE_KEY);
      unify.mount();

      unify.identify('not-a-valid-email');
      expect(mockedIdentifyActivity.track).not.toHaveBeenCalled();

      unify.unmount();
    });
  });

  describe('track', () => {
    it('creates a new TrackActivity and tracks it', () => {
      const unify = new UnifyIntentClient(TEST_WRITE_KEY);
      unify.mount();

      expect(mockedTrackActivity.track).not.toHaveBeenCalled();
      unify.track('Button clicked');
      expect(mockedTrackActivity.track).toHaveBeenCalledTimes(1);

      unify.unmount();
    });
  });

  describe('startAutoIdentify', () => {
    it('tells the Unify Intent Agent to start auto-identification', () => {
      const unify = new UnifyIntentClient(TEST_WRITE_KEY);
      unify.mount();

      expect(mockedIntentAgent.startAutoIdentify).not.toHaveBeenCalled();
      unify.startAutoIdentify();
      expect(mockedIntentAgent.startAutoIdentify).toHaveBeenCalledTimes(1);

      unify.unmount();
    });
  });

  describe('stopAutoIdentify', () => {
    it('tells the Unify Intent Agent to stop auto-identification', () => {
      const unify = new UnifyIntentClient(TEST_WRITE_KEY, {
        autoIdentify: true,
      });
      unify.mount();

      expect(mockedIntentAgent.stopAutoIdentify).not.toHaveBeenCalled();
      unify.stopAutoIdentify();
      expect(mockedIntentAgent.stopAutoIdentify).toHaveBeenCalledTimes(1);

      unify.unmount();
    });
  });

  describe('startAutoTrack', () => {
    it('tells the Unify Intent Agent to start auto-tracking', () => {
      const unify = new UnifyIntentClient(TEST_WRITE_KEY);
      unify.mount();

      expect(mockedIntentAgent.startAutoTrack).not.toHaveBeenCalled();
      unify.startAutoTrack({ clickTrackingSelectors: [] });
      expect(mockedIntentAgent.startAutoTrack).toHaveBeenCalledTimes(1);

      unify.unmount();
    });
  });

  describe('stopAutoTrack', () => {
    it('tells the Unify Intent Agent to stop auto-tracking', () => {
      const unify = new UnifyIntentClient(TEST_WRITE_KEY, {
        autoTrackOptions: { clickTrackingSelectors: [] },
      });
      unify.mount();

      expect(mockedIntentAgent.stopAutoTrack).not.toHaveBeenCalled();
      unify.stopAutoTrack();
      expect(mockedIntentAgent.stopAutoTrack).toHaveBeenCalledTimes(1);

      unify.unmount();
    });
  });

  describe('unmount', () => {
    it('cleans up Unify intent agent', () => {
      const unify = new UnifyIntentClient(TEST_WRITE_KEY, {
        autoPage: true,
        autoIdentify: true,
        autoTrackOptions: { clickTrackingSelectors: [] },
      });
      unify.mount();

      expect(mockedIntentAgent.stopAutoPage).not.toHaveBeenCalled();
      expect(mockedIntentAgent.stopAutoIdentify).not.toHaveBeenCalled();
      expect(mockedIntentAgent.stopAutoTrack).not.toHaveBeenCalled();
      unify.unmount();
      expect(mockedIntentAgent.stopAutoPage).toHaveBeenCalledTimes(1);
      expect(mockedIntentAgent.stopAutoIdentify).toHaveBeenCalledTimes(1);
      expect(mockedIntentAgent.stopAutoTrack).toHaveBeenCalledTimes(1);
    });
  });
});
