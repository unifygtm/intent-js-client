import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

import { IdentityManager, SessionManager } from '../../intent/managers';
import { UnifyIntentClientConfig } from '../../intent/types';
import UnifyApiClient from '../../unify-api-client';
import { DEFAULT_UNIFY_INTENT_CLIENT_CONFIG } from '../../unify-intent-client';
import { TEST_WRITE_KEY } from './data';

const mockedIdentityManager = mockDeep(IdentityManager.prototype);
const mockedSessionManager = mockDeep(SessionManager.prototype);
const mockedApiClient = mockDeep(UnifyApiClient.prototype);

export const MockUnifyIntentContext = (config?: UnifyIntentClientConfig) =>
  ({
    writeKey: TEST_WRITE_KEY,
    clientConfig: {
      ...DEFAULT_UNIFY_INTENT_CLIENT_CONFIG,
      ...config,
    },
    identityManager: mockedIdentityManager,
    sessionManager: mockedSessionManager,
    apiClient: mockedApiClient,
  } as {
    writeKey: string;
    clientConfig: UnifyIntentClientConfig;
    identityManager: DeepMockProxy<IdentityManager>;
    sessionManager: DeepMockProxy<SessionManager>;
    apiClient: DeepMockProxy<UnifyApiClient>;
  });
