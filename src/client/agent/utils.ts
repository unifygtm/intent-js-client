import {
  DEFAULT_FORM_EVENT_TYPES,
  UNIFY_CAPTURE_ATTRIBUTES_DATA_ATTR_PREFIX,
  UNIFY_ELEMENT_EXCLUSION_DATA_ATTR,
  UNIFY_ELEMENT_LABEL_DATA_ATTR,
} from './constants';
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

export function isActionableButton(element: Element): boolean {
  if (isElementHidden(element)) return false;

  const isDisabled =
    (element as HTMLButtonElement | HTMLInputElement).disabled === true ||
    element.getAttribute('aria-disabled') === 'true';
  if (isDisabled) return false;

  if (elementHasDataAttr(element, UNIFY_ELEMENT_EXCLUSION_DATA_ATTR))
    return false;

  return true;
}

export function getElementName(element: Element): string | null {
  const unifyDataLabel = getElementDataAttr(
    element,
    UNIFY_ELEMENT_LABEL_DATA_ATTR,
  );
  if (unifyDataLabel) return unifyDataLabel;

  const textName = getElementTextContent(element);
  if (textName) return normalizeName(textName);

  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) return normalizeName(ariaLabel);

  const labelledBy = getElementLabelledBy(element);
  if (labelledBy) return normalizeName(labelledBy);

  const imageAlt = getElementImageAlt(element);
  if (imageAlt) return normalizeName(imageAlt);

  return null;
}

export function extractUnifyCapturePropertiesFromElement(
  element: Element,
): Record<string, string> {
  if (!(element instanceof HTMLElement)) return {};

  const result: Record<string, string> = {};
  Object.entries(element.dataset).forEach(([key, value]) => {
    if (key.startsWith(UNIFY_CAPTURE_ATTRIBUTES_DATA_ATTR_PREFIX) && value) {
      const effectiveKey = key.slice(
        UNIFY_CAPTURE_ATTRIBUTES_DATA_ATTR_PREFIX.length,
      );
      if (effectiveKey) {
        result[
          `${effectiveKey.charAt(0).toLowerCase()}${effectiveKey.slice(1)}`
        ] = value;
      }
    }
  });

  return result;
}

/**
 * Helper function to check if an element is hidden.
 *
 * @param element - the element to check visibility for
 * @returns `true` if the element is hidden to the user, otherwise `false`
 */
function isElementHidden(element: Element): boolean {
  if (!(element instanceof HTMLElement)) return false;

  if (element.hidden || element.getAttribute('aria-hidden') === 'true') {
    return true;
  }

  const style = getComputedStyle(element);
  return style.display === 'none' || style.visibility === 'hidden';
}

function normalizeName(
  name: string | null | undefined,
  max = 80,
): string | null {
  if (!name) return null;

  const trimmed = name.replace(/\s+/g, ' ').trim();
  if (!trimmed) return null;

  return trimmed.length > max ? trimmed.slice(0, max - 1) + '...' : trimmed;
}

function getElementTextContent(element: Element): string | null {
  return (element as HTMLElement).innerText || element.textContent || '';
}

function getElementLabelledBy(element: Element): string | null {
  const labelledByIds = element.getAttribute('aria-labelledby');
  if (!labelledByIds) return null;

  return labelledByIds
    .split(/\s+/)
    .map((id) => {
      const labelElement = document.getElementById(id);
      if (!labelElement) return null;

      return getElementTextContent(labelElement);
    })
    .filter((label) => !!label)
    .join(' ');
}

function getElementImageAlt(element: Element): string | null {
  const img = element.querySelector('img[alt]') as HTMLImageElement | null;

  return img?.alt || null;
}

function elementHasDataAttr(element: Element, attr: string): boolean {
  if (!(element instanceof HTMLElement)) return false;

  const { dataset } = element;
  return !!dataset[attr];
}

function getElementDataAttr(element: Element, attr: string): string | null {
  if (!(element instanceof HTMLElement)) return null;

  const { dataset } = element;
  if (dataset[attr]) {
    return String(dataset[attr]);
  }

  return null;
}
