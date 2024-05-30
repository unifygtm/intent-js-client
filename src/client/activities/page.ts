import { AnalyticsEventType, PageEventData } from '../../types';
import { UNIFY_INTENT_V1_URL } from '../constants';
import { getCurrentPageProperties } from '../utils/helpers';
import Activity from './activity';

export const UNIFY_INTENT_PAGE_URL = `${UNIFY_INTENT_V1_URL}/page`;

/**
 * Activity for logging a `page` event via the Unify Intent Client.
 */
export class PageActivity extends Activity<PageEventData> {
  protected getActivityType(): AnalyticsEventType {
    return 'page' as PageEventData['type'];
  }

  protected getActivityURL(): string {
    return UNIFY_INTENT_PAGE_URL;
  }

  protected getActivityData = (): PageEventData => ({
    type: 'page' as PageEventData['type'],
    properties: getCurrentPageProperties(),
  });
}
