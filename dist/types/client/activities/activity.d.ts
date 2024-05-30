import { AnalyticsEventType, UnifyIntentContext } from '../../types';
/**
 * Abstract class which other activites should extend. Exposes an interface
 * to track the activity with base activity data and any additional data needed.
 */
declare abstract class Activity<TActivityData extends object> {
    protected readonly _intentContext: UnifyIntentContext;
    constructor(intentContext: UnifyIntentContext);
    /**
     * Tracks this activity by sending a POST request with the activity data
     * to the relevant Unify Intent activity URL.
     */
    track(): void;
    /**
     * Gets the type of the activity.
     */
    protected abstract getActivityType(): AnalyticsEventType;
    /**
     * Gets the Unify Intent URL to send the activity data to.
     */
    protected abstract getActivityURL(): string;
    /**
     * Gets the activity data to send along with the base activity data.
     */
    protected abstract getActivityData(): TActivityData;
    /**
     * Generates the "base" activity data which is included by default in the
     * payload for all intent activities which get logged.
     *
     * @returns the base activity data to log
     */
    private getBaseActivityPayload;
}
export default Activity;
//# sourceMappingURL=activity.d.ts.map