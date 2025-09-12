import { anyString, mock, mockReset } from 'jest-mock-extended';

import {
  LEGACY_VISITOR_ID_STORAGE_KEY,
  IdentityManager,
  VISITOR_ID_STORAGE_KEY,
} from '../../../client/managers';
import { CookieStorageService } from '../../../client/storage';
import { TEST_VISITOR_ID, TEST_WRITE_KEY } from '../../mocks/data';

const cookieStorageMock = mock(CookieStorageService.prototype);
jest.mock('../../../client/storage', () => ({
  ...jest.requireActual('../../../client/storage'),
  CookieStorageService: jest.fn().mockImplementation(() => cookieStorageMock),
}));

describe('IdentityManager', () => {
  beforeEach(() => {
    mockReset(cookieStorageMock);
  });

  describe('getOrCreateVisitorId', () => {
    test('creates new visitor ID if none exists', () => {
      const identityManager = new IdentityManager(TEST_WRITE_KEY);
      const result = identityManager.getOrCreateVisitorId();

      expect(cookieStorageMock.get).toHaveBeenCalledWith(
        VISITOR_ID_STORAGE_KEY,
      );
      expect(cookieStorageMock.get).toHaveBeenCalledWith(
        LEGACY_VISITOR_ID_STORAGE_KEY,
      );
      expect(cookieStorageMock.set).toHaveBeenCalledWith(
        VISITOR_ID_STORAGE_KEY,
        anyString(),
      );
      expect(result).toEqual(anyString());

      const cachedResult = identityManager.getOrCreateVisitorId();
      expect(cachedResult).toEqual(result);
    });

    test('gets visitor ID from storage if one exists', () => {
      cookieStorageMock.get.mockReturnValueOnce(TEST_VISITOR_ID);
      const identityManager = new IdentityManager(TEST_WRITE_KEY);
      const result = identityManager.getOrCreateVisitorId();

      expect(cookieStorageMock.get).toHaveBeenCalledWith(
        VISITOR_ID_STORAGE_KEY,
      );
      expect(cookieStorageMock.get).not.toHaveBeenCalledWith(
        LEGACY_VISITOR_ID_STORAGE_KEY,
      );
      expect(cookieStorageMock.set).not.toHaveBeenCalled();
      expect(result).toEqual(TEST_VISITOR_ID);
    });

    test('gets the cached visitor ID if it exists', () => {
      // Initialize cached value
      cookieStorageMock.get.mockReturnValueOnce(TEST_VISITOR_ID);
      const identityManager = new IdentityManager(TEST_WRITE_KEY);
      identityManager.getOrCreateVisitorId();

      // Clear mock so we can test fresh state
      cookieStorageMock.get.mockClear();

      // Check that cached value exists
      const result = identityManager.getOrCreateVisitorId();
      expect(result).toEqual(TEST_VISITOR_ID);
      expect(cookieStorageMock.get).not.toHaveBeenCalled();
    });
  });
});
