import {
  AnalyticsEventBase,
  AnalyticsEventType,
  UnifyIntentContext,
} from '../../types';
import { getActivityContext } from './utils';

/**
 * Abstract class which other activites should extend. Exposes an interface
 * to track the activity with base activity data and any additional data needed.
 */
abstract class Activity<TActivityData extends object> {
  protected readonly _intentContext: UnifyIntentContext;

  constructor(intentContext: UnifyIntentContext) {
    this._intentContext = intentContext;
  }

  /**
   * Tracks this activity by sending a POST request with the activity data
   * to the relevant Unify Intent activity URL.
   */
  public track(): void {
    this._intentContext.apiClient.post(
      this.getActivityURL(),
      this.getTrackPayload(),
    );
  }

  /**
   * Gets the request payload required to track this activity. This is useful
   * if you want to send the payload to a proxy server to perform the tracking
   * server-side.
   */
  public getTrackPayload(): AnalyticsEventBase & TActivityData {
    return {
      ...this.getBaseActivityPayload(),
      ...this.getActivityData(),
    };
  }

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
  private getBaseActivityPayload = (): AnalyticsEventBase => ({
    type: this.getActivityType(),
    visitorId: this._intentContext.identityManager.getOrCreateVisitorId(),
    sessionId:
      this._intentContext.sessionManager.getOrCreateSession().sessionId,
    context: getActivityContext(),
    timestamp: new Date().toISOString(),
  });
}

export default Activity;
