import { v4 as uuidv4 } from 'uuid';

import { CookieStorageService } from '../storage';

/**
 * @deprecated Prefer `ANONYMOUS_USER_ID_STORAGE_KEY` instead
 */
export const LEGACY_ANONYMOUS_USER_ID_STORAGE_KEY = 'anonymousUserId';

/**
 * The name of the cookie used to store the current user's anonymous user ID.
 */
export const ANONYMOUS_USER_ID_STORAGE_KEY = 'unify_user_id';

/**
 * This class is used to store and manage user identity information
 * in the current user's cookies.
 */
export class IdentityManager {
  private readonly _storageService: CookieStorageService;

  private _anonymousUserId: string | null;

  constructor(writeKey: string) {
    this._storageService = new CookieStorageService(writeKey);
    this._anonymousUserId = null;
  }

  /**
   * Gets an anonymous user ID for the current user if one exists,
   * otherwise creates one for them.
   *
   * @returns the anonymous user ID, a randomly generated UUID
   */
  public getOrCreateAnonymousUserId = (): string => {
    if (this._anonymousUserId) {
      return this._anonymousUserId;
    }

    const anonymousUserId =
      this.getAnonymousUserId() || this.createAnonymousUserId();
    this._anonymousUserId = anonymousUserId;

    return anonymousUserId;
  };

  /**
   * Gets the current user's anonymous user ID from cookies if
   * one exists.
   *
   * @returns the anonymous user ID if it exists, else `null`
   */
  private getAnonymousUserId = (): string | null => {
    const userId = this._storageService.get<string>(
      ANONYMOUS_USER_ID_STORAGE_KEY,
    );

    if (userId) {
      return userId;
    }

    // Fall back to legacy key name for values stored by old client versions
    const legacyUserId = this._storageService.get<string>(
      LEGACY_ANONYMOUS_USER_ID_STORAGE_KEY,
    );

    // Store using new key so the next time we won't need to fall back
    if (legacyUserId) {
      this._storageService.set(ANONYMOUS_USER_ID_STORAGE_KEY, legacyUserId);
    }

    return legacyUserId;
  };

  /**
   * Creates a randomly generated anonymous user ID and stores it
   * in cookies.
   *
   * @returns the newly created and stored anonymous user ID
   */
  private createAnonymousUserId = (): string => {
    const anonymousUserId = uuidv4();
    this._storageService.set(ANONYMOUS_USER_ID_STORAGE_KEY, anonymousUserId);

    return anonymousUserId;
  };
}
