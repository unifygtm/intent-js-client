import { DEFAULT_FORM_EVENT_TYPES } from './constants';
import {
  DefaultEventData,
  DefaultFormCompletedEventData,
  DefaultFormPageSubmittedEventData,
  DefaultFormPageSubmittedV2EventData,
} from './types/default';

export function isDefaultFormEventData(
  data: DefaultEventData,
): data is
  | DefaultFormCompletedEventData
  | DefaultFormPageSubmittedEventData
  | DefaultFormPageSubmittedV2EventData {
  return DEFAULT_FORM_EVENT_TYPES.includes(data.event);
}
