import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended';
import Cookies from 'js-cookie';

import { CookieStorageService } from '../../../client/storage';
import {
  encodeForStorage,
  getCurrentTopLevelDomain,
} from '../../../client/storage/utils';
import { TEST_ANONYMOUS_USER_ID, TEST_WRITE_KEY } from '../../mocks/data';

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
      storageService.get('unify_user_id');
      expect(CookiesMock.get).toHaveBeenCalledWith('unify_user_id');
      expect(CookiesMock.get).toHaveBeenCalledWith(
        encodeForStorage(`${TEST_WRITE_KEY}_unify_user_id`),
      );
    });

    it('works with non-latin-1 characters', () => {
      const storageService = new CookieStorageService('ő');
      storageService.get('unify_user_id');
      expect(CookiesMock.get).toHaveBeenCalledWith(
        encodeForStorage(`ő_unify_user_id`),
      );
    });
  });

  describe('set', () => {
    it('sets the value in the underlying Cookies storage', () => {
      const storageService = new CookieStorageService(TEST_WRITE_KEY);
      storageService.set('unify_user_id', TEST_ANONYMOUS_USER_ID);
      expect(CookiesMock.set).toHaveBeenCalledWith(
        'unify_user_id',
        TEST_ANONYMOUS_USER_ID,
        { domain: `.${getCurrentTopLevelDomain()}`, expires: 365 },
      );
    });

    it('works with non-latin-1 characters', () => {
      const storageService = new CookieStorageService('ő');
      storageService.set('anonymousUserId', TEST_ANONYMOUS_USER_ID);
      expect(CookiesMock.set).toHaveBeenCalledWith(
        encodeForStorage(`ő_anonymousUserId`),
        encodeForStorage(TEST_ANONYMOUS_USER_ID),
        { domain: `.${getCurrentTopLevelDomain()}`, expires: 365 },
      );
    });
  });
});
