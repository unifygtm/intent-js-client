import { mock } from 'jest-mock-extended';

import { initBrowser } from '../../browser';
import { TEST_WRITE_KEY } from '../../tests/mocks/data';
import { IdentifyActivity, PageActivity } from '../../client/activities';
import { UnifyIntentAgent } from '../../client/agent';
import { IdentityManager, SessionManager } from '../../client/managers';

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
jest.mock('../../client/activities', () => ({
  ...jest.requireActual('../../client/activities'),
  IdentifyActivity: jest.fn().mockImplementation(() => mockedIdentifyActivity),
  PageActivity: jest.fn().mockImplementation(() => mockedPageActivity),
}));

const MOCK_UNIFY_TAG_WRITE_KEY = `
    <script id="unifytag" data-write-key="${TEST_WRITE_KEY}"></script>
`;

const MOCK_UNIFY_TAG_API_KEY = `
    <script id="unifytag" data-api-key="${TEST_WRITE_KEY}"></script>
`;

describe('Browser', () => {
  beforeEach(() => {
    document.body.innerHTML = MOCK_UNIFY_TAG_WRITE_KEY;
    window.unify = undefined;
    window.unifyBrowser = undefined;
  });

  describe('initBrowser', () => {
    it('initializes a UnifyIntentClient on the window', () => {
      expect(window.unify).toBeFalsy();
      expect(window.unifyBrowser).toBeFalsy();
      initBrowser();
      expect(window.unify).toBeTruthy();
      expect(window.unifyBrowser).toBeTruthy();
    });

    it('falls back to data-api-key for legacy scripts', () => {
      document.body.innerHTML = MOCK_UNIFY_TAG_API_KEY;
      expect(window.unify).toBeFalsy();
      expect(window.unifyBrowser).toBeFalsy();
      initBrowser();
      expect(window.unify).toBeTruthy();
      expect(window.unifyBrowser).toBeTruthy();
    });
  });
});
