import type { ActivityContext, CampaignParams } from '../../types';
import { getCurrentUserAgentData } from '../utils/helpers';

/**
 * Constructs the activity context data which is logged for page,
 * identity, etc. actions.
 *
 * @returns the activity context data
 */
export const getActivityContext = (): ActivityContext => {
  const url = new URL(location.href);

  const utm: CampaignParams = {
    source: url.searchParams.get('utm_source') ?? undefined,
    medium: url.searchParams.get('utm_medium') ?? undefined,
    campaign: url.searchParams.get('utm_campaign') ?? undefined,
    term: url.searchParams.get('utm_term') ?? undefined,
    content: url.searchParams.get('utm_content') ?? undefined,
  };

  return {
    locale: navigator.language,
    ...getCurrentUserAgentData(),
    utm,
  };
};
