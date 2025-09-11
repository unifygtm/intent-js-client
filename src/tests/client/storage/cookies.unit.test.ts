import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended';
import Cookies from 'js-cookie';

import { CookieStorageService } from '../../../client/storage';
import {
  encodeForStorage,
  getCurrentTopLevelDomain,
} from '../../../client/storage/utils';
import { TEST_ANONYMOUS_USER_ID, TEST_WRITE_KEY } from '../../mocks/data';
import { ANONYMOUS_USER_ID_STORAGE_KEY } from '../../../client/managers';

jest.mock('js-cookie', () => ({
  __esModule: true,
  default: mockDeep<any>(),
}));
export const CookiesMock = Cookies as unknown as DeepMockProxy<typeof Cookies>;

describe('CookieStorageService', () => {
  beforeEach(() => {
    mockReset(CookiesMock);
  });

  describe('get', () => {
    it('gets the value from underlying Cookies storage', () => {
      const storageService = new CookieStorageService(TEST_WRITE_KEY);
      storageService.get(ANONYMOUS_USER_ID_STORAGE_KEY);
      expect(CookiesMock.get).toHaveBeenCalledWith(
        ANONYMOUS_USER_ID_STORAGE_KEY,
      );
      expect(CookiesMock.get).toHaveBeenLastCalledWith(
        encodeForStorage(`${TEST_WRITE_KEY}_unify_user_id`),
      );
    });
  });

  describe('set', () => {
    it('sets the value in the underlying Cookies storage', () => {
      const storageService = new CookieStorageService(TEST_WRITE_KEY);
      storageService.set(ANONYMOUS_USER_ID_STORAGE_KEY, TEST_ANONYMOUS_USER_ID);
      expect(CookiesMock.set).toHaveBeenCalledWith(
        ANONYMOUS_USER_ID_STORAGE_KEY,
        TEST_ANONYMOUS_USER_ID,
        { domain: `.${getCurrentTopLevelDomain()}`, expires: 365 },
      );
    });
  });
});
