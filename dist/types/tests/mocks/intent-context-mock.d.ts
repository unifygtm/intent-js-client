import { DeepMockProxy } from 'jest-mock-extended';
import { IdentityManager, SessionManager } from 'client/managers';
import UnifyApiClient from 'client/unify-api-client';
import { UnifyIntentClientConfig } from 'types';
export declare const MockUnifyIntentContext: (config?: UnifyIntentClientConfig) => {
    writeKey: string;
    clientConfig: UnifyIntentClientConfig;
    identityManager: DeepMockProxy<IdentityManager>;
    sessionManager: DeepMockProxy<SessionManager>;
    apiClient: DeepMockProxy<UnifyApiClient>;
};
//# sourceMappingURL=intent-context-mock.d.ts.map