import { UCompany, UPerson } from '../../types';
import UnifyApiClient from '../unify-api-client';
import { getDomainForEmail, getDomainForUrl } from '../utils/helpers';
import { logUnifyError } from '../utils/logging';
import {
  DEFAULT_FORM_EVENT_TYPES,
  UNIFY_CUSTOM_PROPERTY_DATA_ATTR_PREFIXES,
  UNIFY_ELEMENT_EXCLUSION_DATA_ATTR,
  UNIFY_ELEMENT_LABEL_DATA_ATTR,
} from './constants';
import {
  DefaultEventData,
  DefaultFormCompletedEventData,
  DefaultFormPageSubmittedEventData,
  DefaultFormPageSubmittedV2EventData,
} from './types/default';
import {
  NavatticDefaultCustomPropertyName,
  NavatticEventData,
  NavatticEventDataProperty,
  NavatticObject,
} from './types/navattic';

export function isDefaultFormEventData(
  data: DefaultEventData,
): data is
  | DefaultFormCompletedEventData
  | DefaultFormPageSubmittedEventData
  | DefaultFormPageSubmittedV2EventData {
  return DEFAULT_FORM_EVENT_TYPES.includes(data.event);
}

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

export function getUAttributesForDefaultEventData(
  data: DefaultEventData,
  apiClient?: UnifyApiClient,
): { person?: UPerson; company?: UCompany } | undefined {
  if (!isDefaultFormEventData(data)) return undefined;

  try {
    const { email, attributes } = data.payload;

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

function getNavatticProperty(
  name: NavatticDefaultCustomPropertyName,
  source: NavatticObject,
  properties: NavatticEventDataProperty[],
): string | null {
  return (
    properties.find(({ object, name: n }) => object === source && n === name)
      ?.value ?? null
  );
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
