import type {
  AnalyticsEventType,
  IdentifyEventData,
  UCompany,
  UnifyIntentContext,
  UPerson,
} from '../../types';
import { UNIFY_INTENT_V1_URL } from '../constants';
import { getDomainForEmail, getDomainForUrl } from '../utils/helpers';
import Activity from './activity';

export const UNIFY_INTENT_IDENTIFY_URL = `${UNIFY_INTENT_V1_URL}/identify`;

/**
 * Activity for logging an `identify` event via the Unify Intent Client.
 */
export class IdentifyActivity extends Activity<IdentifyEventData> {
  private readonly _company: UCompany | undefined;
  private readonly _email: string;
  private readonly _person: UPerson | undefined;

  constructor(
    intentContext: UnifyIntentContext,
    {
      email,
      person,
      company,
    }: { email: string; person?: UPerson; company?: UCompany },
  ) {
    super(intentContext);
    this._email = email;
    this._person = person;
    this._company = company;
  }

  protected getActivityType(): AnalyticsEventType {
    return 'identify';
  }

  protected getActivityURL(): string {
    return UNIFY_INTENT_IDENTIFY_URL;
  }

  protected getActivityData = (): IdentifyEventData => {
    const companyDomain =
      this._company && getDomainForUrl(this._company?.domain);
    const emailDomain = getDomainForEmail(this._email);

    const company: UCompany | undefined =
      companyDomain && companyDomain === emailDomain
        ? this._company
        : undefined;

    return {
      type: 'identify',
      person: {
        ...this._person,
        email: this._email,
      },
      ...(company && { company: this._company }),
    };
  };
}
