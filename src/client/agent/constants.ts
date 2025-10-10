import { DefaultEventType } from './types/default';

/**
 * @deprecated use `UNIFY_CLICK_EVENT_NAME_DATA_ATTR_SELECTOR_NAME` instead
 */
export const UNIFY_TRACK_CLICK_DATA_ATTR_SELECTOR_NAME =
  'data-unify-track-clicks';
export const UNIFY_TRACK_CLICK_DATA_ATTR = 'unifyTrackClicks';

/**
 * This is the name of the data attribute which can be
 * specified on an element on the page to designate that clicking the
 * element should automatically fire a track event. By default, the content
 * of the element will be used for the `label` in the event properties, but
 * `data-unify-label` can be used to override that name.
 */
export const UNIFY_CLICK_EVENT_NAME_DATA_ATTR_SELECTOR_NAME =
  'data-unify-click-event-name';
export const UNIFY_CLICK_EVENT_NAME_DATA_ATTR = 'unifyClickEventName';

/**
 * This is the camel case name of the data attribute which can be
 * specified on an auto-tracked element (e.g. a `<button>` element) in
 * order to override the name of the element in the auto-tracked properties.
 *
 * For example, when a `<button>` with `data-unify-label="Custom"` is clicked
 * and auto-tracking is enabled, the `buttonName` in the track event properties
 * will be set to "Custom" even if the element contains different text.
 */
export const UNIFY_ELEMENT_LABEL_DATA_ATTR = 'unifyLabel';

/**
 * @deprecated use `UNIFY_EVENT_PROPERTY_DATA_ATTR_PREFIX` instead
 */
export const UNIFY_ATTRIBUTES_DATA_ATTR_PREFIX = 'unifyAttr';

/**
 * This is the prefix for data attributes which can be specified on
 * auto-tracked elements (e.g. `<button>` elements) in order to include
 * custom properties in the track event properties.
 *
 * For example, when a `<button>` has the attributes:
 * - `data-unify-event-prop-custom-property="1"`
 * - `data-unify-event-prop-another-property="100"`
 *
 * The auto-track event will contain `properties`:
 * `{ "customProperty": "1", "anotherProperty": "100" }`
 */
export const UNIFY_EVENT_PROPERTY_DATA_ATTR_PREFIX = 'unifyEventProp';

export const UNIFY_CUSTOM_PROPERTY_DATA_ATTR_PREFIXES = [
  UNIFY_ATTRIBUTES_DATA_ATTR_PREFIX,
  UNIFY_EVENT_PROPERTY_DATA_ATTR_PREFIX,
];

/**
 * This is the camel case name of the data attribute which can be
 * specified on an auto-tracked element (e.g. a `<button>` element) in
 * order to exclude it from auto-tracking.
 *
 * For example, when a `<button>` with `data-unify-exclude` is clicked
 * and auto-tracking is enabled, the click will _not_ be auto-tracked
 * even though it would under normal circumstances.
 */
export const UNIFY_ELEMENT_EXCLUSION_DATA_ATTR = 'unifyExclude';

export const DEFAULT_FORMS_IFRAME_ORIGIN = 'https://forms.default.com';
export const NAVATTIC_IFRAME_ORIGIN = 'https://capture.navattic.com';

export const DEFAULT_FORM_EVENT_TYPES: DefaultEventType[] = [
  DefaultEventType.FORM_COMPLETED,
  DefaultEventType.FORM_PAGE_SUBMITTED,
  DefaultEventType.FORM_PAGE_SUBMITTED_V2,
];

export const PRODUCT_DEMO_NAVATTIC_PROVIDER_NAME = 'Navattic';
