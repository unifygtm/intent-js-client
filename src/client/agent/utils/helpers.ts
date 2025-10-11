import {
  UNIFY_CUSTOM_PROPERTY_DATA_ATTR_PREFIXES,
  UNIFY_ELEMENT_EXCLUSION_DATA_ATTR,
  UNIFY_ELEMENT_LABEL_DATA_ATTR,
} from '../constants';

export function isActionableElement(element: Element): boolean {
  if (!(element instanceof HTMLElement)) return false;

  if (isElementHidden(element)) return false;

  // `<button disabled>`, `<fieldset disabled>`, `<input disabled>`, etc.
  if (element.matches(':disabled')) return false;

  if (element.getAttribute('aria-disabled') === 'true') return false;

  if (element.classList.contains('disabled')) return false;

  if (elementHasDataAttr(element, UNIFY_ELEMENT_EXCLUSION_DATA_ATTR))
    return false;

  return true;
}

export function getElementLabel(element: Element): string | null {
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
    UNIFY_CUSTOM_PROPERTY_DATA_ATTR_PREFIXES.forEach((prefix) => {
      if (key.startsWith(prefix) && value) {
        const effectiveKey = key.slice(prefix.length);
        if (effectiveKey) {
          result[
            `${effectiveKey.charAt(0).toLowerCase()}${effectiveKey.slice(1)}`
          ] = value;
        }
      }
    });
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

export function elementHasDataAttr(element: Element, attr: string): boolean {
  if (!(element instanceof HTMLElement)) return false;

  const { dataset } = element;
  return dataset[attr] !== undefined;
}

export function getElementDataAttr(
  element: Element,
  attr: string,
): string | null {
  if (!(element instanceof HTMLElement)) return null;

  const { dataset } = element;
  if (dataset[attr] !== undefined) {
    return String(dataset[attr]);
  }

  return null;
}
