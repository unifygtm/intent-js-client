import {
  AnalyticsEventType,
  TrackEventData,
  UnifyIntentContext,
} from '../../types';
import { UNIFY_INTENT_V1_URL } from '../constants';
import Activity from './activity';

export const UNIFY_INTENT_TRACK_URL = `${UNIFY_INTENT_V1_URL}/track`;

/**
 * Activity for logging a `track` event via the Unify Intent Client.
 */
export class TrackActivity extends Activity<TrackEventData> {
  private readonly _name: string;
  private readonly _properties: TrackEventData['properties'];

  constructor(
    intentContext: UnifyIntentContext,
    { name, properties }: Pick<TrackEventData, 'name' | 'properties'>,
  ) {
    super(intentContext);
    this._name = name;
    this._properties = properties;
  }

  protected getActivityType(): AnalyticsEventType {
    return 'track' as TrackEventData['type'];
  }

  protected getActivityURL(): string {
    return UNIFY_INTENT_TRACK_URL;
  }

  protected getActivityData = (): TrackEventData => ({
    type: 'track' as TrackEventData['type'],
    name: this._name,
    properties: this._properties,
  });
}
