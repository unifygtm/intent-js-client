import { PageProperties } from '@unifygtm/analytics-types';

import { IdentityManager, SessionManager } from './managers';
import UnifyApiClient from './unify-api-client';

export interface UnifyIntentClientConfig {
  /**
   * This option can be specified to indicate that the Unify client
   * should instantiate an agent which automatically collects user
   * email inputs, contact form submissions, etc.
   */
  autoIdentify?: boolean;
}

export interface UnifyIntentContext {
  writeKey: string;
  clientConfig: UnifyIntentClientConfig;
  apiClient: UnifyApiClient;
  sessionManager: SessionManager;
  identityManager: IdentityManager;
}

export type ClientSession = {
  sessionId: string;
  expiration: number;
  startTime: Date;
  initial: PageProperties;
} & UserAgentDataType;

export interface UserAgentDataType {
  userAgent: NavigatorID['userAgent'];
  userAgentData?: NavigatorUAData;
}
