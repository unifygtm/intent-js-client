import { AnalyticsEventType, IdentifyEventData, UnifyIntentContext } from 'types';
import Activity from './activity';
export declare const UNIFY_INTENT_IDENTIFY_URL = "https://unifyintent.com/analytics/api/v1/identify";
/**
 * Activity for logging an `identify` event via the Unify Intent Client.
 */
export declare class IdentifyActivity extends Activity<IdentifyEventData> {
    private readonly _email;
    constructor(intentContext: UnifyIntentContext, { email }: {
        email: string;
    });
    protected getActivityType(): AnalyticsEventType;
    protected getActivityURL(): string;
    protected getActivityData: () => IdentifyEventData;
}
//# sourceMappingURL=identify.d.ts.map