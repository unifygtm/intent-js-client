import { v4 as uuidv4 } from 'uuid';

import { CookieStorageService } from '../storage';

export const ANONYMOUS_USER_ID_STORAGE_KEY = 'anonymousUserId';

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
    return this._storageService.get(ANONYMOUS_USER_ID_STORAGE_KEY);
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
