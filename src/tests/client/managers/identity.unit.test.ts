import { anyString, mock, mockReset } from 'jest-mock-extended';

import {
  ANONYMOUS_USER_ID_STORAGE_KEY,
  IdentityManager,
} from '../../../client/managers';
import { CookieStorageService } from '../../../client/storage';
import { TEST_ANONYMOUS_USER_ID, TEST_WRITE_KEY } from '../../mocks/data';

const cookieStorageMock = mock(CookieStorageService.prototype);
jest.mock('../../../storage', () => ({
  ...jest.requireActual('../../../storage'),
  CookieStorageService: jest.fn().mockImplementation(() => cookieStorageMock),
}));

describe('IdentityManager', () => {
  beforeEach(() => {
    mockReset(cookieStorageMock);
  });

  describe('getOrCreateAnonymousUserId', () => {
    test('creates new anonymous user ID if none exists', () => {
      const identityManager = new IdentityManager(TEST_WRITE_KEY);
      const result = identityManager.getOrCreateAnonymousUserId();

      expect(cookieStorageMock.get).toHaveBeenCalledWith(
        ANONYMOUS_USER_ID_STORAGE_KEY
      );
      expect(cookieStorageMock.set).toHaveBeenCalledWith(
        ANONYMOUS_USER_ID_STORAGE_KEY,
        anyString()
      );
      expect(result).toEqual(anyString());

      const cachedResult = identityManager.getOrCreateAnonymousUserId();
      expect(cachedResult).toEqual(result);
    });

    test('gets anonymous user ID from storage if one exists', () => {
      cookieStorageMock.get.mockReturnValueOnce(TEST_ANONYMOUS_USER_ID);
      const identityManager = new IdentityManager(TEST_WRITE_KEY);
      const result = identityManager.getOrCreateAnonymousUserId();

      expect(cookieStorageMock.set).not.toHaveBeenCalled();
      expect(result).toEqual(TEST_ANONYMOUS_USER_ID);
    });

    test('gets the cached anonymous user ID if it exists', () => {
      // Initialize cached value
      cookieStorageMock.get.mockReturnValueOnce(TEST_ANONYMOUS_USER_ID);
      const identityManager = new IdentityManager(TEST_WRITE_KEY);
      identityManager.getOrCreateAnonymousUserId();

      // Clear mock so we can test fresh state
      cookieStorageMock.get.mockClear();

      // Check that cached value exists
      const result = identityManager.getOrCreateAnonymousUserId();
      expect(result).toEqual(TEST_ANONYMOUS_USER_ID);
      expect(cookieStorageMock.get).not.toHaveBeenCalled();
    });
  });
});
