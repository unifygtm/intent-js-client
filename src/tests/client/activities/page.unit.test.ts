import { anyObject, mockReset } from 'jest-mock-extended';

import {
  PageActivity,
  UNIFY_INTENT_PAGE_URL,
} from '../../../client/activities';
import type { PageEventData } from '../../../types';
import { MockClientSession, TEST_VISITOR_ID } from '../../mocks/data';
import { MockUnifyIntentContext } from '../../mocks/intent-context-mock';

describe('PageActivity', () => {
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

    it('tracks a page activity with page properties', () => {
      const page = new PageActivity(mockContext);
      page.track();
      expect(mockContext.apiClient.post).toHaveBeenCalledWith(
        UNIFY_INTENT_PAGE_URL,
        anyObject(),
      );
      const data = mockContext.apiClient.post.mock.calls[0][1] as PageEventData;
      expect(data.type).toEqual('page');
      expect(data.properties).toEqual(anyObject());
    });

    it('uses the optional pathname for page properties when provided', () => {
      const CUSTOM_PAGE = '/some-custom-page';
      const page = new PageActivity(mockContext, { pathname: CUSTOM_PAGE });
      page.track();
      expect(mockContext.apiClient.post).toHaveBeenCalledWith(
        UNIFY_INTENT_PAGE_URL,
        anyObject(),
      );
      const data = mockContext.apiClient.post.mock.calls[0][1] as PageEventData;
      expect(data.properties?.path).toEqual('/some-custom-page');
    });
  });
});
