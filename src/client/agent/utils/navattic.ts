import {
  UPerson,
  UCompany,
  AutoTrackOptions,
  UnifyIntentContext,
  NavatticTrackEvent,
} from '../../../types';
import { TrackActivity } from '../../activities';
import UnifyApiClient from '../../unify-api-client';
import { getDomainForUrl, getDomainForEmail } from '../../utils/helpers';
import { logUnifyError } from '../../utils/logging';
import {
  NavatticEventData,
  NavatticDefaultCustomPropertyName,
  NavatticObject,
  NavatticEventDataProperty,
  NavatticEventType,
} from '../types/navattic';

export function getUAttributesForNavatticEventData(
  data: NavatticEventData,
  apiClient?: UnifyApiClient,
): { person?: UPerson; company?: UCompany } | undefined {
  try {
    const eventDataProperties = data.properties ?? [];
    const email = getNavatticProperty(
      NavatticDefaultCustomPropertyName.Email,
      NavatticObject.END_USER,
      eventDataProperties,
    );

    if (!email) return undefined;

    const fullName = getNavatticProperty(
      NavatticDefaultCustomPropertyName.FullName,
      NavatticObject.END_USER,
      eventDataProperties,
    );
    const firstName = fullName
      ? fullName.split(' ')[0]
      : getNavatticProperty(
          NavatticDefaultCustomPropertyName.FirstName,
          NavatticObject.END_USER,
          eventDataProperties,
        );
    const lastName = fullName
      ? fullName.split(' ')[1]
      : getNavatticProperty(
          NavatticDefaultCustomPropertyName.LastName,
          NavatticObject.END_USER,
          eventDataProperties,
        );

    const phone = getNavatticProperty(
      NavatticDefaultCustomPropertyName.Phone,
      NavatticObject.END_USER,
      eventDataProperties,
    );

    const person: UPerson = {
      email,
      ...(firstName && { first_name: firstName }),
      ...(lastName && { last_name: lastName }),
      ...(phone && { mobile_phone: phone }),
    };

    const rawDomain = getNavatticProperty(
      NavatticDefaultCustomPropertyName.CompanyDomain,
      NavatticObject.COMPANY_ACCOUNT,
      eventDataProperties,
    );
    const domain = rawDomain ? getDomainForUrl(rawDomain) : null;

    let company: UCompany | undefined;
    if (domain && domain === getDomainForEmail(email)) {
      const companyName =
        getNavatticProperty(
          NavatticDefaultCustomPropertyName.CompanyName,
          NavatticObject.COMPANY_ACCOUNT,
          eventDataProperties,
        ) ?? undefined;

      const companyDescription =
        getNavatticProperty(
          NavatticDefaultCustomPropertyName.CompanyDescription,
          NavatticObject.COMPANY_ACCOUNT,
          eventDataProperties,
        ) ?? undefined;

      const companyLinkedInUrl =
        getNavatticProperty(
          NavatticDefaultCustomPropertyName.CompanyLinkedin,
          NavatticObject.COMPANY_ACCOUNT,
          eventDataProperties,
        ) ?? undefined;

      const companyIndustry = getNavatticProperty(
        NavatticDefaultCustomPropertyName.CompanyIndustry,
        NavatticObject.COMPANY_ACCOUNT,
        eventDataProperties,
      );

      const companyFounded = getNavatticProperty(
        NavatticDefaultCustomPropertyName.CompanyFoundedYear,
        NavatticObject.COMPANY_ACCOUNT,
        eventDataProperties,
      );

      const companyRawEmployeeCount =
        getNavatticProperty(
          NavatticDefaultCustomPropertyName.CompanyEmployeeCount,
          NavatticObject.COMPANY_ACCOUNT,
          eventDataProperties,
        ) ?? undefined;
      const companyEmployeeCount = !isNaN(Number(companyRawEmployeeCount))
        ? Number(companyRawEmployeeCount)
        : undefined;

      company = {
        domain,
        ...(companyName && { name: companyName }),
        ...(companyDescription && { description: companyDescription }),
        ...(companyLinkedInUrl && { linkedin_url: companyLinkedInUrl }),
        ...(companyIndustry && { industry: companyIndustry }),
        ...(companyFounded && { founded: companyFounded }),
        ...(companyEmployeeCount && { employee_count: companyEmployeeCount }),
      };
    }

    return { person, ...(company && { company }) };
  } catch (error: unknown) {
    logUnifyError({
      message: `Error occurred while parsing attributes from Navattic event payload: ${error}`,
      error: error as Error,
      apiClient,
    });
    return undefined;
  }
}

export function getNavatticProperty(
  name: NavatticDefaultCustomPropertyName,
  source: NavatticObject,
  properties: NavatticEventDataProperty[],
): string | null {
  return (
    properties.find(({ object, name: n }) => object === source && n === name)
      ?.value ?? null
  );
}

export function maybeTrackNavatticEvent({
  data,
  autoTrackOptions,
  intentContext,
}: {
  data: NavatticEventData;
  autoTrackOptions: AutoTrackOptions;
  intentContext: UnifyIntentContext;
}) {
  if (!autoTrackOptions.navatticProductDemos) return;

  const {
    [NavatticTrackEvent.NAVATTIC_DEMO_STARTED]: shouldTrackDemoStarted,
    [NavatticTrackEvent.NAVATTIC_DEMO_STEP_VIEWED]: shouldTrackStepViewed,
    [NavatticTrackEvent.NAVATTIC_DEMO_COMPLETED]: shouldTrackDemoCompleted,
  } = autoTrackOptions.navatticProductDemos === true
    ? {
        [NavatticTrackEvent.NAVATTIC_DEMO_STARTED]: true,
        [NavatticTrackEvent.NAVATTIC_DEMO_STEP_VIEWED]: true,
        [NavatticTrackEvent.NAVATTIC_DEMO_COMPLETED]: true,
      }
    : autoTrackOptions.navatticProductDemos;

  switch (data.type) {
    case NavatticEventType.START_FLOW: {
      if (!shouldTrackDemoStarted) return;

      const startedDemoActivity = new TrackActivity(intentContext, {
        name: NavatticTrackEvent.NAVATTIC_DEMO_STARTED,
        properties: {
          demo: data.flow?.name,
          wasAutoTracked: true,
        },
      });
      startedDemoActivity.track();
      return;
    }
    case NavatticEventType.VIEW_STEP: {
      if (!shouldTrackStepViewed) return;

      const viewedStepActivity = new TrackActivity(intentContext, {
        name: NavatticTrackEvent.NAVATTIC_DEMO_STEP_VIEWED,
        properties: {
          demo: data.flow?.name,
          step: data.step?.name,
          wasAutoTracked: true,
        },
      });
      viewedStepActivity.track();
      return;
    }
    case NavatticEventType.COMPLETE_FLOW: {
      if (!shouldTrackDemoCompleted) return;

      const completedDemoActivity = new TrackActivity(intentContext, {
        name: NavatticTrackEvent.NAVATTIC_DEMO_COMPLETED,
        properties: {
          demo: data.flow?.name,
          wasAutoTracked: true,
        },
      });
      completedDemoActivity.track();
      return;
    }
  }
}
