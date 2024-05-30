import { AnalyticsEventType, PageEventData } from '../../types';
import Activity from './activity';
export declare const UNIFY_INTENT_PAGE_URL = "https://unifyintent.com/analytics/api/v1/page";
/**
 * Activity for logging a `page` event via the Unify Intent Client.
 */
export declare class PageActivity extends Activity<PageEventData> {
    protected getActivityType(): AnalyticsEventType;
    protected getActivityURL(): string;
    protected getActivityData: () => PageEventData;
}
//# sourceMappingURL=page.d.ts.map