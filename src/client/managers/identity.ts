import { v4 as uuidv4 } from 'uuid';

import { CookieStorageService } from '../storage';

/**
 * @deprecated Prefer `VISITOR_ID_STORAGE_KEY` instead
 */
export const LEGACY_VISITOR_ID_STORAGE_KEY = 'anonymousUserId';

/**
 * The name of the cookie used to store the current visitor ID.
 */
export const VISITOR_ID_STORAGE_KEY = 'unify_visitor_id';

/**
 * This class is used to store and manage user identity information
 * in the current user's cookies.
 */
export class IdentityManager {
  private readonly _storageService: CookieStorageService;

  private _visitorId: string | null;

  constructor(writeKey: string) {
    this._storageService = new CookieStorageService(writeKey);
    this._visitorId = null;
  }

  /**
   * Gets a visitor ID for the current user if one exists,
   * otherwise creates one for them.
   *
   * @returns the visitor ID, a randomly generated UUID
   */
  public getOrCreateVisitorId = (): string => {
    if (this._visitorId) {
      return this._visitorId;
    }

    const visitorId = this.getVisitorId() || this.createVisitorId();
    this._visitorId = visitorId;

    return visitorId;
  };

  /**
   * Gets the current visitor ID from cookies if one exists.
   *
   * @returns the visitor ID if it exists, else `null`
   */
  private getVisitorId = (): string | null => {
    const visitorId = this._storageService.get<string>(VISITOR_ID_STORAGE_KEY);

    if (visitorId) {
      return visitorId;
    }

    // Fall back to legacy key name for values stored by old client versions
    const legacyVisitorId = this._storageService.get<string>(
      LEGACY_VISITOR_ID_STORAGE_KEY,
    );

    // Store using new key so the next time we won't need to fall back
    if (legacyVisitorId) {
      this._storageService.set(VISITOR_ID_STORAGE_KEY, legacyVisitorId);
    }

    return legacyVisitorId;
  };

  /**
   * Creates a randomly generated visitor ID and stores it in cookies.
   *
   * @returns the newly created and stored visitor ID
   */
  private createVisitorId = (): string => {
    const visitorId = uuidv4();
    this._storageService.set(VISITOR_ID_STORAGE_KEY, visitorId);

    return visitorId;
  };
}
