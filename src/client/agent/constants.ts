import { DefaultEventType } from './types/default';

export const DEFAULT_FORMS_IFRAME_ORIGIN = 'https://forms.default.com';

export const DEFAULT_FORM_EVENT_TYPES: DefaultEventType[] = [
  DefaultEventType.FORM_COMPLETED,
  DefaultEventType.FORM_PAGE_SUBMITTED,
  DefaultEventType.FORM_PAGE_SUBMITTED_V2,
];
