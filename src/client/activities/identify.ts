import {
  AnalyticsEventType,
  IdentifyEventData,
  UnifyIntentContext,
} from 'types';

import { UNIFY_INTENT_V1_URL } from '../constants';
import Activity from './activity';

export const UNIFY_INTENT_IDENTIFY_URL = `${UNIFY_INTENT_V1_URL}/identify`;

/**
 * Activity for logging an `identify` event via the Unify Intent Client.
 */
export class IdentifyActivity extends Activity<IdentifyEventData> {
  private readonly _email: string;

  constructor(intentContext: UnifyIntentContext, { email }: { email: string }) {
    super(intentContext);
    this._email = email;
  }

  protected getActivityType(): AnalyticsEventType {
    return 'identify' as IdentifyEventData['type'];
  }

  protected getActivityURL(): string {
    return UNIFY_INTENT_IDENTIFY_URL;
  }

  protected getActivityData = (): IdentifyEventData => ({
    type: 'identify' as IdentifyEventData['type'],
    traits: {
      email: this._email,
    },
  });
}
