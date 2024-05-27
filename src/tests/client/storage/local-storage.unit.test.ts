import { LocalStorageService } from '../../../client/storage';
import {
  encodeForStorage,
  isLocalStorageAvailable,
} from '../../../client/storage/utils';
import { MockClientSession, TEST_WRITE_KEY } from '../../mocks/data';

jest.mock('../../storage/utils', () => ({
  ...jest.requireActual('../../storage/utils'),
  isLocalStorageAvailable: jest.fn(),
}));

const mockedIsLocalStorageAvailable = jest.mocked<
  typeof isLocalStorageAvailable
>(isLocalStorageAvailable);
const mockedGetItem = jest.mocked<typeof localStorage.getItem>(
  localStorage.getItem
);
const mockedSetItem = jest.mocked<typeof localStorage.setItem>(
  localStorage.setItem
);

describe('LocalStorageService', () => {
  beforeEach(() => {
    localStorage.clear();
    mockedGetItem.mockClear();
    mockedSetItem.mockClear();
  });

  describe('get', () => {
    describe('when local storage is available', () => {
      beforeEach(() => {
        mockedIsLocalStorageAvailable.mockReturnValueOnce(true);
      });

      it('gets the value from underlying local storage', () => {
        const storageService = new LocalStorageService(TEST_WRITE_KEY);
        storageService.get('clientSession');
        expect(localStorage.getItem).toHaveBeenLastCalledWith(
          encodeForStorage(`${TEST_WRITE_KEY}_clientSession`)
        );
      });

      it('works with non-latin-1 characters', () => {
        const storageService = new LocalStorageService('ő');
        storageService.get('clientSession');
        expect(localStorage.getItem).toHaveBeenLastCalledWith(
          encodeForStorage(`ő_clientSession`)
        );
      });
    });

    describe('when local storage is not available', () => {
      beforeEach(() => {
        mockedIsLocalStorageAvailable.mockReturnValueOnce(false);
      });

      it('does nothing', () => {
        mockedIsLocalStorageAvailable.mockReturnValue(false);
        const storageService = new LocalStorageService(TEST_WRITE_KEY);
        storageService.get('clientSession');
        expect(localStorage.getItem).not.toHaveBeenCalled();
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
        expect(localStorage.setItem).toHaveBeenLastCalledWith(
          encodeForStorage(`${TEST_WRITE_KEY}_key`),
          encodeForStorage('1234')
        );
      });

      it('works with non-latin-1 characters', () => {
        const storageService = new LocalStorageService('ő');
        storageService.set('key', '1234');
        expect(localStorage.setItem).toHaveBeenLastCalledWith(
          encodeForStorage(`ő_key`),
          encodeForStorage('1234')
        );
      });

      it('works for complex object storage', () => {
        const mockClientSession = MockClientSession();
        const storageService = new LocalStorageService(TEST_WRITE_KEY);
        storageService.set('key', mockClientSession);
        expect(localStorage.setItem).toHaveBeenLastCalledWith(
          encodeForStorage(`${TEST_WRITE_KEY}_key`),
          encodeForStorage(mockClientSession)
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
        expect(localStorage.setItem).not.toHaveBeenCalled();
      });
    });
  });
});
