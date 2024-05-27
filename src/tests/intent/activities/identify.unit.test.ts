import { IdentifyRequestData } from '@unifygtm/analytics-types';
import { anyObject, mockReset } from 'jest-mock-extended';

import {
  IdentifyActivity,
  UNIFY_INTENT_IDENTIFY_URL,
} from '../../../intent/activities';
import { MockClientSession, TEST_ANONYMOUS_USER_ID } from '../../mocks/data';
import { MockUnifyIntentContext } from '../../mocks/intent-context-mock';

describe('IdentifyActivity', () => {
  const mockContext = MockUnifyIntentContext();

  beforeEach(() => {
    mockReset(mockContext.apiClient);
    mockReset(mockContext.identityManager);
    mockReset(mockContext.sessionManager);
  });

  describe('track', () => {
    beforeEach(() => {
      mockContext.sessionManager.getOrCreateSession.mockReturnValue(
        MockClientSession(),
      );
      mockContext.identityManager.getOrCreateAnonymousUserId.mockReturnValue(
        TEST_ANONYMOUS_USER_ID,
      );
    });

    it('tracks an identify activity with user traits', () => {
      const identify = new IdentifyActivity(mockContext, {
        email: 'solomon@unifygtm.com',
      });
      identify.track();
      expect(mockContext.apiClient.post).toHaveBeenCalledWith(
        UNIFY_INTENT_IDENTIFY_URL,
        anyObject(),
      );
      const data = mockContext.apiClient.post.mock
        .calls[0][1] as IdentifyRequestData;
      expect(data.type).toEqual('identify');
      expect(data.traits.email).toEqual('solomon@unifygtm.com');
    });
  });
});
