import { anyObject, mockReset } from 'jest-mock-extended';

import {
  IdentifyActivity,
  UNIFY_INTENT_IDENTIFY_URL,
} from '../../../client/activities';
import type { IdentifyEventData } from '../../../types';
import { MockClientSession, TEST_VISITOR_ID } from '../../mocks/data';
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
      mockContext.identityManager.getOrCreateVisitorId.mockReturnValue(
        TEST_VISITOR_ID,
      );
    });

    it('tracks an identify activity with person and company payloads', () => {
      const identify = new IdentifyActivity(mockContext, {
        email: 'solomon@unifygtm.com',
        person: {
          email: 'solomon@unifygtm.com',
        },
        company: {
          domain: 'unifygtm.com',
          name: 'Unify',
        },
      });
      identify.track();
      expect(mockContext.apiClient.post).toHaveBeenCalledWith(
        UNIFY_INTENT_IDENTIFY_URL,
        anyObject(),
      );
      const data = mockContext.apiClient.post.mock
        .calls[0][1] as IdentifyEventData;
      expect(data.type).toEqual('identify');
      expect(data.person?.email).toEqual('solomon@unifygtm.com');
      expect(data.company?.domain).toEqual('unifygtm.com');
    });

    it('only includes the company in the payload if domain matches email', () => {
      const identify = new IdentifyActivity(mockContext, {
        email: 'solomon@unifygtm.com',
        person: {
          email: 'solomon@unifygtm.com',
        },
        company: {
          domain: 'somethingelse.com',
          name: 'Unify',
        },
      });
      identify.track();
      expect(mockContext.apiClient.post).toHaveBeenCalledWith(
        UNIFY_INTENT_IDENTIFY_URL,
        anyObject(),
      );
      const data = mockContext.apiClient.post.mock
        .calls[0][1] as IdentifyEventData;
      expect(data.type).toEqual('identify');
      expect(data.person?.email).toEqual('solomon@unifygtm.com');
      expect(data.company).toBeUndefined();
    });
  });
});
