import { ActivityType, PageRequestData } from '@unifygtm/analytics-types';

import { getCurrentPageProperties } from '../utils/helpers';
import { UNIFY_INTENT_V1_URL } from '../constants';
import Activity from './activity';

export const UNIFY_INTENT_PAGE_URL = `${UNIFY_INTENT_V1_URL}/page`;

/**
 * Activity for logging a `page` event via the Unify Intent Client.
 */
export class PageActivity extends Activity<PageRequestData> {
  protected getActivityType(): ActivityType {
    return 'page' as ActivityType.PAGE;
  }

  protected getActivityURL(): string {
    return UNIFY_INTENT_PAGE_URL;
  }

  protected getActivityData = (): PageRequestData => ({
    type: 'page' as ActivityType.PAGE,
    properties: getCurrentPageProperties(),
  });
}
