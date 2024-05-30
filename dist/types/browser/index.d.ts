import UnifyIntentClient from 'client';
declare global {
    interface Window {
        unify?: UnifyIntentClient;
    }
}
/**
 * Initializes the `UnifyIntentClient` and flushes pre-made method calls
 * from the global context if there are any.
 */
export declare const initBrowser: () => void;
//# sourceMappingURL=index.d.ts.map