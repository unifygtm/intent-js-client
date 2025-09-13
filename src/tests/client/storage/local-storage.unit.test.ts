import { LocalStorageService } from '../../../client/storage';
import {
  encodeForStorage,
  isLocalStorageAvailable,
} from '../../../client/storage/utils';
import { MockClientSession, TEST_WRITE_KEY } from '../../mocks/data';

jest.mock('../../../client/storage/utils', () => ({
  ...jest.requireActual('../../../client/storage/utils'),
  isLocalStorageAvailable: jest.fn(),
}));

const mockedIsLocalStorageAvailable = jest.mocked(isLocalStorageAvailable);

describe('LocalStorageService', () => {
  const mockGetItem = jest.fn();
  const mockSetItem = jest.fn();
  const mockRemoveItem = jest.fn();

  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: (...args: string[]) => mockGetItem(...args),
      setItem: (...args: string[]) => mockSetItem(...args),
      removeItem: (...args: string[]) => mockRemoveItem(...args),
    },
  });

  beforeEach(() => {
    mockGetItem.mockClear();
    mockSetItem.mockClear();
    mockRemoveItem.mockClear();
  });

  describe('get', () => {
    describe('when local storage is available', () => {
      beforeEach(() => {
        mockedIsLocalStorageAvailable.mockReturnValueOnce(true);
      });

      it('gets the value from underlying local storage', () => {
        const storageService = new LocalStorageService(TEST_WRITE_KEY);
        storageService.get('clientSession');
        expect(mockGetItem).toHaveBeenCalledWith('clientSession');
        expect(mockGetItem).toHaveBeenLastCalledWith(
          encodeForStorage(`${TEST_WRITE_KEY}_clientSession`),
        );
      });
    });

    describe('when local storage is not available', () => {
      beforeEach(() => {
        mockedIsLocalStorageAvailable.mockReturnValueOnce(false);
      });

      it('does nothing', () => {
        const storageService = new LocalStorageService(TEST_WRITE_KEY);
        storageService.get('clientSession');
        expect(mockGetItem).not.toHaveBeenCalled();
      });
    });
  });

  describe('set', () => {
    describe('when local storage is available', () => {
      beforeEach(() => {
        mockedIsLocalStorageAvailable.mockReturnValueOnce(true);
      });

      it('sets the value in the underlying local storage', () => {
        const storageService = new LocalStorageService(TEST_WRITE_KEY);
        storageService.set('key', '1234');
        expect(mockSetItem).toHaveBeenCalledWith('key', '1234');
        expect(mockSetItem).toHaveBeenLastCalledWith(
          encodeForStorage(`${TEST_WRITE_KEY}_key`),
          encodeForStorage('1234'),
        );
      });

      it('works for complex object storage', () => {
        const mockClientSession = MockClientSession();
        const storageService = new LocalStorageService(TEST_WRITE_KEY);
        storageService.set('key', mockClientSession);
        expect(mockSetItem).toHaveBeenCalledWith(
          'key',
          JSON.stringify(mockClientSession),
        );
        expect(mockSetItem).toHaveBeenLastCalledWith(
          encodeForStorage(`${TEST_WRITE_KEY}_key`),
          encodeForStorage(mockClientSession),
        );
      });
    });

    describe('when local storage is not available', () => {
      beforeEach(() => {
        mockedIsLocalStorageAvailable.mockReturnValueOnce(false);
      });

      it('does nothing', () => {
        const storageService = new LocalStorageService(TEST_WRITE_KEY);
        storageService.set('key', '1234');
        expect(mockSetItem).not.toHaveBeenCalled();
      });
    });
  });
});
