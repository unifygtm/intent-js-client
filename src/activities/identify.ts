import { ActivityType, IdentifyRequestData } from '@unifygtm/analytics-types';

import { UNIFY_INTENT_V1_URL } from '../constants';
import { UnifyIntentContext } from '../types';
import Activity from './activity';

export const UNIFY_INTENT_IDENTIFY_URL = `${UNIFY_INTENT_V1_URL}/identify`;

/**
 * Activity for logging an `identify` event via the Unify Intent Client.
 */
export class IdentifyActivity extends Activity<IdentifyRequestData> {
  private readonly _email: string;

  constructor(intentContext: UnifyIntentContext, { email }: { email: string }) {
    super(intentContext);
    this._email = email;
  }

  protected getActivityType(): ActivityType {
    return 'identify' as ActivityType.IDENTIFY;
  }

  protected getActivityURL(): string {
    return UNIFY_INTENT_IDENTIFY_URL;
  }

  protected getActivityData = (): IdentifyRequestData => ({
    type: 'identify' as ActivityType.IDENTIFY,
    traits: {
      email: this._email,
    },
  });
}
