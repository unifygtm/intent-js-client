import { mock, mockReset } from 'jest-mock-extended';

import { initBrowser } from '../../browser';
import UnifyIntentClient from '../../client';
import { TEST_WRITE_KEY } from '../../tests/mocks/data';

const mockIntentClient = mock(UnifyIntentClient.prototype);
jest.mock('client', () => ({
  ...jest.requireActual('client'),
  __esModule: true,
  default: jest.fn().mockImplementation(() => mockIntentClient),
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
    mockReset(mockIntentClient);
  });

  describe('initBrowser', () => {
    it('initializes a UnifyIntentClient on the window', () => {
      expect(window.unify).toBeFalsy();
      initBrowser();
      expect(window.unify).toBeTruthy();
    });

    it('falls back to data-api-key for legacy scripts', () => {
      document.body.innerHTML = MOCK_UNIFY_TAG_API_KEY;
      expect(window.unify).toBeFalsy();
      initBrowser();
      expect(window.unify).toBeTruthy();
    });

    it('clears methods in the queue', () => {
      // @ts-expect-error
      window.unify = [['page'], ['identify', 'solomon@unifygtm.com']];
      initBrowser();
      expect(mockIntentClient.page).toHaveBeenCalledTimes(1);
      expect(mockIntentClient.identify).toHaveBeenCalledWith(
        'solomon@unifygtm.com',
      );
      expect(window.unify).toBeTruthy();
    });
  });
});
