import { v4 as uuidv4 } from 'uuid';

import { ClientSession } from '../../types';
import { CookieStorageService, LocalStorageService } from '../storage';
import {
  getCurrentPageProperties,
  getCurrentUserAgentData,
  getTimeForMinutesInFuture,
} from '../utils/helpers';
import { DEFAULT_SESSION_MINUTES_TO_EXPIRE } from '../constants';

export type SessionManagerOptions = {
  durationMinutes?: number;
};

const DEFAULT_SESSION_MANAGER_OPTIONS: SessionManagerOptions = {
  durationMinutes: DEFAULT_SESSION_MINUTES_TO_EXPIRE,
};

/**
 * @deprecated Prefer `SESSION_STORAGE_KEY` instead
 */
export const LEGACY_SESSION_STORAGE_KEY = 'clientSession';

/**
 * The local storage key used to track the user's current session ID.
 */
export const SESSION_STORAGE_KEY = 'unify_session';

/**
 * The key used to store the current session ID in cookies.
 */
export const SESSION_ID_STORAGE_KEY = 'unify_session_id';

/**
 * This class is used to store and manage user session data in
 * local browser storage.
 */
export class SessionManager {
  private readonly _writeKey: string;
  private readonly _options: SessionManagerOptions;
  private readonly _storageService: LocalStorageService;
  private readonly _cookieStorageService: CookieStorageService;

  private _currentSession: ClientSession | null;

  constructor(writeKey: string, options?: SessionManagerOptions) {
    this._writeKey = writeKey;
    this._options = options ?? DEFAULT_SESSION_MANAGER_OPTIONS;
    this._storageService = new LocalStorageService(this._writeKey);
    this._cookieStorageService = new CookieStorageService(this._writeKey);
    this._currentSession = null;
  }

  /**
   * Gets the current user session if one exists, otherwise creates one.
   *
   * @returns the current or new user session
   */
  public getOrCreateSession = (): ClientSession => {
    return this.getAndUpdateSession() || this.createSession();
  };

  /**
   * Gets the current user session if it exists. If it does exist, also
   * updates the expiration time of the session based on the current time.
   *
   * @returns the current session if it exists, else `undefined`
   */
  private getAndUpdateSession = (): ClientSession | undefined => {
    const session = this._currentSession || this.getStoredSession();
    if (!session) return undefined;

    const isActive = session.expiration > new Date().getTime();
    if (isActive) {
      const updatedSession = this.updateSessionExpiration(session);
      return updatedSession;
    } else {
      return undefined;
    }
  };

  /**
   * Creates a new session in local storage.
   * @returns the newly created session
   */
  private createSession = (): ClientSession => {
    const session: ClientSession = {
      sessionId: uuidv4(),
      startTime: new Date(),
      expiration: getTimeForMinutesInFuture(
        this._options.durationMinutes ?? DEFAULT_SESSION_MINUTES_TO_EXPIRE,
      ),
      initial: getCurrentPageProperties(),
      ...getCurrentUserAgentData(),
    };

    this._currentSession = session;
    this.setStoredSession(session);

    return session;
  };

  /**
   * Updates the expiration time of an existing session in
   * local storage.
   *
   * @param existingSession - the session to update expiration time for
   * @returns the updated session object
   */
  private updateSessionExpiration = (
    existingSession: ClientSession,
  ): ClientSession => {
    const updatedSession: ClientSession = {
      ...existingSession,
      expiration: getTimeForMinutesInFuture(
        this._options.durationMinutes ?? DEFAULT_SESSION_MINUTES_TO_EXPIRE,
      ),
    };
    this._currentSession = updatedSession;
    this.setStoredSession(updatedSession);

    return updatedSession;
  };

  /**
   * Retrieves a session object from local storage.
   *
   * @returns the stored session object, or `null` if none exists
   */
  private getStoredSession = (): ClientSession | null => {
    const session =
      this._storageService.get<ClientSession>(SESSION_STORAGE_KEY);

    if (session) {
      return session;
    }

    // Fall back to legacy key name for values stored by old client versions
    const legacySession = this._storageService.get<ClientSession>(
      LEGACY_SESSION_STORAGE_KEY,
    );

    // Store using new key so the next time we won't need to fall back
    if (legacySession) {
      this.setStoredSession(legacySession);
    }

    return legacySession;
  };

  /**
   * Stores a session object in local storage and updates the ID
   *
   * @param session - the session to store
   */
  private setStoredSession = (session: ClientSession): void => {
    this._storageService.set(SESSION_STORAGE_KEY, session);
    this._cookieStorageService.set(SESSION_ID_STORAGE_KEY, session.sessionId);
  };
}
