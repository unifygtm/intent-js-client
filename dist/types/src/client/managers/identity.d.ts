export declare const ANONYMOUS_USER_ID_STORAGE_KEY = "anonymousUserId";
/**
 * This class is used to store and manage user identity information
 * in the current user's cookies.
 */
export declare class IdentityManager {
    private readonly _storageService;
    private _anonymousUserId;
    constructor(writeKey: string);
    /**
     * Gets an anonymous user ID for the current user if one exists,
     * otherwise creates one for them.
     *
     * @returns the anonymous user ID, a randomly generated UUID
     */
    getOrCreateAnonymousUserId: () => string;
    /**
     * Gets the current user's anonymous user ID from cookies if
     * one exists.
     *
     * @returns the anonymous user ID if it exists, else `null`
     */
    private getAnonymousUserId;
    /**
     * Creates a randomly generated anonymous user ID and stores it
     * in cookies.
     *
     * @returns the newly created and stored anonymous user ID
     */
    private createAnonymousUserId;
}
//# sourceMappingURL=identity.d.ts.map