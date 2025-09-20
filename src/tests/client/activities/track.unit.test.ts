import { anyObject, mockReset } from 'jest-mock-extended';

import { TrackEventData } from '../../../types';
import { MockClientSession, TEST_VISITOR_ID } from '../../mocks/data';
import { MockUnifyIntentContext } from '../../mocks/intent-context-mock';
import {
  TrackActivity,
  UNIFY_INTENT_TRACK_URL,
} from '../../../client/activities/track';

describe('TrackActivity', () => {
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

    it('tracks a track activity with name and properties', () => {
      const activity = new TrackActivity(mockContext, {
        name: 'Test Event',
        properties: { customProperty: 'Test' },
      });
      activity.track();
      expect(mockContext.apiClient.post).toHaveBeenCalledWith(
        UNIFY_INTENT_TRACK_URL,
        anyObject(),
      );
      const data = mockContext.apiClient.post.mock
        .calls[0][1] as TrackEventData;
      expect(data.type).toEqual('track');
      expect(data.name).toEqual('Test Event');
      expect(data.properties).toEqual({ customProperty: 'Test' });
    });

    it('tracks a track activity when no properties provided', () => {
      const activity = new TrackActivity(mockContext, { name: 'Test Event' });
      activity.track();
      expect(mockContext.apiClient.post).toHaveBeenCalledWith(
        UNIFY_INTENT_TRACK_URL,
        anyObject(),
      );
      const data = mockContext.apiClient.post.mock
        .calls[0][1] as TrackEventData;
      expect(data.type).toEqual('track');
      expect(data.name).toEqual('Test Event');
      expect(data.properties).toBeUndefined();
    });
  });
});
