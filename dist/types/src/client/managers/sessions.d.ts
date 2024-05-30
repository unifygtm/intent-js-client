import { ClientSession } from '../../types';
export declare const CLIENT_SESSION_STORAGE_KEY = "clientSession";
export declare const SESSION_MINUTES_TO_EXPIRE = 30;
/**
 * This class is used to store and manage user session data in
 * local browser storage.
 */
export declare class SessionManager {
    private readonly _writeKey;
    private readonly _storageService;
    private _currentSession;
    constructor(writeKey: string);
    /**
     * Gets the current user session if one exists, otherwise creates one.
     *
     * @returns the current or new user session
     */
    getOrCreateSession: () => ClientSession;
    /**
     * Gets the current user session if it exists. If it does exist, also
     * updates the expiration time of the session based on the current time.
     *
     * @returns the current session if it exists, else `undefined`
     */
    private getAndUpdateSession;
    /**
     * Creates a new session in local storage.
     *
     * @param minutesToExpire - optional number of minutes after which the
     *        user session should expire, defaults to `SESSION_MINUTES_TO_EXPIRE`
     * @returns the newly created session
     */
    private createSession;
    /**
     * Updates the expiration time of an existing session in
     * local storage.
     *
     * @param existingSession - the session to update expiration time for
     * @param minutesToExpire - optional number of minutes after which the
     *        session should expire, defaults to `MINUTES_TO_EXPIRE`
     * @returns the updated session object
     */
    private updateSessionExpiration;
    /**
     * Retrieves a session object from local storage.
     *
     * @returns the stored session object, or `null` if none exists
     */
    private getStoredSession;
    /**
     * Stores a session object in local storage.
     *
     * @param session - the session to store
     */
    private setStoredSession;
}
//# sourceMappingURL=sessions.d.ts.map