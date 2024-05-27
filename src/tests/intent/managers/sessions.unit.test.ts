import { anyNumber, mock, mockReset } from 'jest-mock-extended';

import {
  CLIENT_SESSION_STORAGE_KEY,
  SessionManager,
} from '../../../intent/managers';
import { LocalStorageService } from '../../../storage';
import { ClientSession } from '../../../types';
import { MockClientSession, TEST_WRITE_KEY } from '../../mocks/data';

const localStorageMock = mock(LocalStorageService.prototype);
jest.mock('../../../storage', () => ({
  ...jest.requireActual('../../../storage'),
  LocalStorageService: jest.fn().mockImplementation(() => localStorageMock),
}));

describe('SessionManager', () => {
  beforeEach(() => {
    mockReset(localStorageMock);
  });

  describe('getOrCreateSession', () => {
    it('creates a new session if none exists', () => {
      const sessionManager = new SessionManager(TEST_WRITE_KEY);
      const result = sessionManager.getOrCreateSession();

      expect(localStorageMock.get).toHaveBeenCalledWith(
        CLIENT_SESSION_STORAGE_KEY,
      );
      expect(localStorageMock.set).toHaveBeenCalledWith(
        CLIENT_SESSION_STORAGE_KEY,
        result,
      );
    });

    describe('when a session already exists', () => {
      let mockSession: ClientSession;

      describe('when the session is not expired', () => {
        beforeEach(() => {
          const tenMinutesFromNow = new Date();
          tenMinutesFromNow.setMinutes(tenMinutesFromNow.getMinutes() + 10);
          mockSession = MockClientSession({
            expiration: tenMinutesFromNow.getTime(),
          });
          localStorageMock.get.mockReturnValueOnce(mockSession);
        });

        it('updates the session expiration time and returns it', () => {
          const sessionManager = new SessionManager(TEST_WRITE_KEY);
          const session = sessionManager.getOrCreateSession();

          const expectedSession = {
            ...mockSession,
            expiration: anyNumber(),
          };

          expect(localStorageMock.set).toHaveBeenCalledTimes(1);
          expect(localStorageMock.set).toHaveBeenCalledWith(
            CLIENT_SESSION_STORAGE_KEY,
            expectedSession,
          );
          expect(session.expiration).toBeGreaterThan(mockSession.expiration);
        });

        it('gets the cached session if it exists, but still updates session', () => {
          // Initialize cached value
          localStorageMock.get.mockReturnValueOnce(mockSession);
          const sessionManager = new SessionManager(TEST_WRITE_KEY);
          sessionManager.getOrCreateSession();

          // Clear mock so we can test fresh state
          localStorageMock.get.mockClear();
          localStorageMock.set.mockClear();

          // Check that cached value exists
          const session = sessionManager.getOrCreateSession();
          expect(session).toEqual({
            ...mockSession,
            expiration: anyNumber(),
          });
          expect(session.expiration).toBeGreaterThan(mockSession.expiration);
          expect(localStorageMock.get).not.toHaveBeenCalled();
          expect(localStorageMock.set).toHaveBeenCalledTimes(1);
          expect(localStorageMock.set).toHaveBeenCalledWith(
            CLIENT_SESSION_STORAGE_KEY,
            session,
          );
        });
      });

      describe('when the session is expired', () => {
        beforeEach(() => {
          const tenMinutesAgo = new Date();
          tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);
          mockSession = MockClientSession({
            expiration: tenMinutesAgo.getTime(),
          });
          localStorageMock.get.mockReturnValueOnce(mockSession);
        });

        it('creates a new session and stores it', () => {
          const sessionManager = new SessionManager(TEST_WRITE_KEY);
          const result = sessionManager.getOrCreateSession();

          expect(localStorageMock.get).toHaveBeenCalledTimes(1);
          expect(localStorageMock.set).toHaveBeenCalledTimes(1);
          expect(localStorageMock.set).toHaveBeenCalledWith(
            CLIENT_SESSION_STORAGE_KEY,
            result,
          );
        });
      });
    });
  });
});
