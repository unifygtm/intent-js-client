import {
  type UPerson,
  type UCompany,
  type AutoTrackOptions,
  DefaultTrackEvent,
  type UnifyIntentContext,
} from '../../../types';
import { TrackActivity } from '../../activities';
import UnifyApiClient from '../../unify-api-client';
import { getDomainForUrl, getDomainForEmail } from '../../utils/helpers';
import { logUnifyError } from '../../utils/logging';
import { DEFAULT_FORM_EVENT_TYPES } from '../constants';
import {
  type DefaultEventData,
  DefaultEventType,
  type DefaultFormCompletedEventData,
  type DefaultFormPageSubmittedEventData,
  type DefaultFormPageSubmittedV2EventData,
} from '../types/default';

export function isDefaultFormEventData(
  data: DefaultEventData,
): data is
  | DefaultFormCompletedEventData
  | DefaultFormPageSubmittedEventData
  | DefaultFormPageSubmittedV2EventData {
  return (
    typeof data !== 'string' && DEFAULT_FORM_EVENT_TYPES.includes(data.event)
  );
}

export function getUAttributesForDefaultEventData(
  data: DefaultEventData,
  apiClient?: UnifyApiClient,
): { person?: UPerson; company?: UCompany } | undefined {
  if (!isDefaultFormEventData(data)) return undefined;

  try {
    const { email, attributes } = data.payload;
    if (!email) return;

    const person: UPerson = {
      email,
      ...(attributes && {
        ...(attributes.first_name && { first_name: attributes.first_name }),
        ...(attributes.last_name && { last_name: attributes.last_name }),
        ...(attributes.phone && { mobile_phone: attributes.phone }),
        ...(attributes.title && { title: attributes.title }),
      }),
    };

    const domain = attributes?.website
      ? getDomainForUrl(attributes.website)
      : null;

    let company: UCompany | undefined;
    if (domain && domain === getDomainForEmail(email)) {
      const employeeCount =
        attributes && !isNaN(Number(attributes.head_count))
          ? Number(attributes.head_count)
          : undefined;

      company = {
        domain,
        ...(attributes && {
          ...(attributes.company && { name: attributes.company }),
          ...(attributes.industry_group && {
            industry: attributes.industry_group,
          }),
          ...(employeeCount && { employee_count: employeeCount }),
        }),
      };
    }

    return { person, ...(company && { company }) };
  } catch (error: unknown) {
    logUnifyError({
      message: `Error occurred while parsing attributes from Default event payload: ${error}`,
      error: error as Error,
      apiClient,
    });
    return undefined;
  }
}

export function maybeTrackDefaultEvent({
  data,
  autoTrackOptions,
  intentContext,
}: {
  data: DefaultEventData;
  autoTrackOptions: AutoTrackOptions;
  intentContext: UnifyIntentContext;
}): DefaultTrackEvent | null {
  if (!autoTrackOptions.defaultForms || typeof data === 'string') return null;

  const {
    [DefaultTrackEvent.DEFAULT_FORM_COMPLETED]: shouldTrackFormCompleted,
    [DefaultTrackEvent.DEFAULT_FORM_PAGE_SUBMITTED]:
      shouldTrackFormPageSubmitted,
    [DefaultTrackEvent.DEFAULT_MEETING_BOOKED]: shouldTrackMeetingBooked,
    [DefaultTrackEvent.DEFAULT_SCHEDULER_CLOSED]: shouldTrackSchedulerClosed,
    [DefaultTrackEvent.DEFAULT_SCHEDULER_DISPLAYED]:
      shouldTrackSchedulerDisplayed,
  } = autoTrackOptions.defaultForms === true
    ? {
        [DefaultTrackEvent.DEFAULT_FORM_COMPLETED]: true,
        [DefaultTrackEvent.DEFAULT_FORM_PAGE_SUBMITTED]: true,
        [DefaultTrackEvent.DEFAULT_MEETING_BOOKED]: true,
        [DefaultTrackEvent.DEFAULT_SCHEDULER_CLOSED]: true,
        [DefaultTrackEvent.DEFAULT_SCHEDULER_DISPLAYED]: true,
      }
    : autoTrackOptions.defaultForms;

  switch (data.event) {
    case DefaultEventType.FORM_COMPLETED: {
      if (!shouldTrackFormCompleted) return null;

      const formCompletedActivity = new TrackActivity(intentContext, {
        name: DefaultTrackEvent.DEFAULT_FORM_COMPLETED,
        properties: {
          form: data.payload.formName,
          formId: data.payload.formId?.toString(),
          wasAutoTracked: true,
        },
      });
      formCompletedActivity.track();
      return DefaultTrackEvent.DEFAULT_FORM_COMPLETED;
    }
    case DefaultEventType.FORM_PAGE_SUBMITTED:
    case DefaultEventType.FORM_PAGE_SUBMITTED_V2: {
      if (!shouldTrackFormPageSubmitted) return null;

      const formPageSubmittedActivity = new TrackActivity(intentContext, {
        name: DefaultTrackEvent.DEFAULT_FORM_PAGE_SUBMITTED,
        properties: {
          form: data.payload.formName,
          formId: data.payload.formId?.toString(),
          pageNumber: data.payload.pageNumber?.toString(),
          wasAutoTracked: true,
        },
      });
      formPageSubmittedActivity.track();
      return DefaultTrackEvent.DEFAULT_FORM_PAGE_SUBMITTED;
    }
    case DefaultEventType.MEETING_BOOKED: {
      if (!shouldTrackMeetingBooked) return null;

      const { memberName, memberEmail, durationInMinutes, startDateTime } =
        data.payload;

      const meetingBookedActivity = new TrackActivity(intentContext, {
        name: DefaultTrackEvent.DEFAULT_MEETING_BOOKED,
        properties: {
          memberName,
          memberEmail,
          durationInMinutes: durationInMinutes?.toString(),
          startDateTime,
          wasAutoTracked: true,
        },
      });
      meetingBookedActivity.track();
      return DefaultTrackEvent.DEFAULT_MEETING_BOOKED;
    }
    case DefaultEventType.SCHEDULER_CLOSED: {
      if (!shouldTrackSchedulerClosed) return null;

      const schedulerClosedActivity = new TrackActivity(intentContext, {
        name: DefaultTrackEvent.DEFAULT_SCHEDULER_CLOSED,
        properties: {
          wasAutoTracked: true,
        },
      });
      schedulerClosedActivity.track();
      return DefaultTrackEvent.DEFAULT_SCHEDULER_CLOSED;
    }
    case DefaultEventType.SCHEDULER_DISPLAYED: {
      if (!shouldTrackSchedulerDisplayed) return null;

      const schedulerDisplayedActivity = new TrackActivity(intentContext, {
        name: DefaultTrackEvent.DEFAULT_SCHEDULER_DISPLAYED,
        properties: {
          formId: data.payload.formId?.toString(),
          wasAutoTracked: true,
        },
      });
      schedulerDisplayedActivity.track();
      return DefaultTrackEvent.DEFAULT_SCHEDULER_DISPLAYED;
    }
  }

  return null;
}
