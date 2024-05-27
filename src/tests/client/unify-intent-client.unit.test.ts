import { mock, mockReset } from 'jest-mock-extended';

import UnifyIntentClient from '../../client';
import { IdentifyActivity, PageActivity } from '../../client/activities';
import { IdentityManager, SessionManager } from '../../client/managers';
import UnifyIntentAgent from '../../client/unify-intent-agent';
import { TEST_WRITE_KEY } from '../mocks/data';

const mockedIdentityManager = mock(IdentityManager.prototype);
const mockedSessionManager = mock(SessionManager.prototype);
jest.mock('../../intent/managers', () => ({
  ...jest.requireActual('../../intent/managers'),
  IdentityManager: jest.fn().mockImplementation(() => mockedIdentityManager),
  SessionManager: jest.fn().mockImplementation(() => mockedSessionManager),
}));

const mockedIntentAgent = mock(UnifyIntentAgent.prototype);
jest.mock('../../intent/unify-intent-agent', () => ({
  ...jest.requireActual('../../intent/unify-intent-agent'),
  __esModule: true,
  default: jest.fn().mockImplementation(() => mockedIntentAgent),
}));

const mockedIdentifyActivity = mock(IdentifyActivity.prototype);
const mockedPageActivity = mock(PageActivity.prototype);
jest.mock('../../intent/activities', () => ({
  ...jest.requireActual('../../intent/managers'),
  IdentifyActivity: jest.fn().mockImplementation(() => mockedIdentifyActivity),
  PageActivity: jest.fn().mockImplementation(() => mockedPageActivity),
}));

describe('UnifyIntentClient', () => {
  beforeEach(() => {
    mockReset(mockedIdentityManager);
    mockReset(mockedSessionManager);
    mockReset(mockedIntentAgent);
    mockReset(mockedPageActivity);
    mockReset(mockedIdentifyActivity);
  });

  it('initializes an anonymous user ID and client session', () => {
    new UnifyIntentClient(TEST_WRITE_KEY);
    expect(
      mockedIdentityManager.getOrCreateAnonymousUserId
    ).toHaveBeenCalledTimes(1);
    expect(mockedSessionManager.getOrCreateSession).toHaveBeenCalledTimes(1);
  });

  it('does not start auto-identify by default', () => {
    new UnifyIntentClient(TEST_WRITE_KEY);
    expect(mockedIntentAgent.startAutoIdentify).not.toHaveBeenCalled();
  });

  it('starts auto-identify when specified by the config', () => {
    new UnifyIntentClient(TEST_WRITE_KEY, { autoIdentify: true });
    expect(mockedIntentAgent.startAutoIdentify).toHaveBeenCalledTimes(1);
  });

  describe('page', () => {
    it('creates a new PageActivity and tracks it', () => {
      const unify = new UnifyIntentClient(TEST_WRITE_KEY);
      unify.page();
      expect(mockedPageActivity.track).toHaveBeenCalledTimes(1);
    });
  });

  describe('identify', () => {
    it('creates a new IdentifyActivity and tracks it when valid', () => {
      const unify = new UnifyIntentClient(TEST_WRITE_KEY);
      unify.identify('solomon@unifygtm.com');
      expect(mockedIdentifyActivity.track).toHaveBeenCalledTimes(1);
    });

    it('does nothing when the email argument is invalid', () => {
      const unify = new UnifyIntentClient(TEST_WRITE_KEY);
      unify.identify('not-a-valid-email');
      expect(mockedIdentifyActivity.track).not.toHaveBeenCalled();
    });
  });

  describe('startAutoIdentify', () => {
    it('tells the Unify Intent Agent to start auto-identification', () => {
      const unify = new UnifyIntentClient(TEST_WRITE_KEY);
      expect(mockedIntentAgent.startAutoIdentify).not.toHaveBeenCalled();

      unify.startAutoIdentify();
      expect(mockedIntentAgent.startAutoIdentify).toHaveBeenCalledTimes(1);
    });
  });

  describe('stopAutoIdentify', () => {
    it('tells the Unify Intent Agent to stop auto-identification', () => {
      const unify = new UnifyIntentClient(TEST_WRITE_KEY, {
        autoIdentify: true,
      });
      expect(mockedIntentAgent.stopAutoIdentify).not.toHaveBeenCalled();

      unify.stopAutoIdentify();
      expect(mockedIntentAgent.stopAutoIdentify).toHaveBeenCalledTimes(1);
    });
  });
});
