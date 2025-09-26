/**
 * All possible event types emitted by Navattic.
 */
export enum NavatticEventType {
  VIEW_STEP = 'VIEW_STEP',
  START_FLOW = 'START_FLOW',
  COMPLETE_FLOW = 'COMPLETE_FLOW',
  START_CHECKLIST = 'START_CHECKLIST',
  OPEN_CHECKLIST = 'OPEN_CHECKLIST',
  CLOSE_CHECKLIST = 'CLOSE_CHECKLIST',
  COMPLETE_TASK = 'COMPLETE_TASK',
  CONVERTED = 'CONVERTED',
  NAVIGATE = 'NAVIGATE',
  IDENTIFY_USER = 'IDENTIFY_USER',
  ENGAGE = 'ENGAGE',
}

/**
 * All possible sources for user attributes identifiable by Navattic.
 */
export enum NavatticAttributeSource {
  FORM = 'FORM',
  IDENTIFY = 'IDENTIFY',
  QUERY_PARAMS = 'QUERY_PARAMS',
  SHARE_LINK = 'SHARE_LINK',
  ENRICHMENT = 'ENRICHMENT',
  REDUCER = 'REDUCER',
  OTHER = 'OTHER',
}

/**
 * Known object types for Navattic event data.
 */
export enum NavatticObject {
  COMPANY_ACCOUNT = 'COMPANY_ACCOUNT',
  END_USER = 'END_USER',
}

/**
 * Known capture methods for Navattic event data.
 */
export enum NavatticCaptureMethod {
  DEMO = 'DEMO',
}

export interface NavatticProject {
  /**
   * ID of the project.
   */
  id: string;

  /**
   * Name of the project.
   */
  name: string;
}

export interface NavatticFlow {
  /**
   * ID of the flow.
   */
  id: string;

  /**
   * Name of the flow.
   */
  name: string;
}

export interface NavatticStep {
  /**
   * Name of the step.
   */
  name: string;

  /**
   * Zero-based index of the step in the flow.
   */
  indx: number;
}

export interface NavatticChecklist {
  /**
   * ID of the checklist.
   */
  id: string;

  /**
   * Name of the checklist.
   */
  name: string;
}

export interface NavatticTask {
  /**
   * ID of the task.
   */
  id: string;

  /**
   * Title of the task.
   */
  title: string;
}

export enum NavatticDefaultCustomPropertyName {
  FirstName = 'firstName',
  LastName = 'lastName',
  FullName = 'fullName',
  Email = 'email',
  Phone = 'phone',
  OperatingSystem = 'os',
  Browser = 'browser',
  BrowserVersion = 'browserVersion',
  Device = 'device',
  City = 'visitorCity',
  State = 'visitorState',
  Country = 'visitorCountry',
  PostalCode = 'visitorPostalCode',
  CurrentURL = 'currentURL',
  Path = 'path',
  SessionId = 'sessionId',
  ScreenWidth = 'screenWidth',
  ScreenHeight = 'screenHeight',
  UtmCampaign = 'utm_campaign',
  UtmContent = 'utm_content',
  UtmMedium = 'utm_medium',
  UtmSource = 'utm_source',
  UtmReferrer = 'utm_referrer',
  UtmTerm = 'utm_term',
  LastViewedFlowId = 'lastViewedFlowId',
  LastViewedFlowName = 'lastViewedFlowName',
  LastViewedStepName = 'lastViewedStepName',
  LastViewedStepIndex = 'lastViewedStepIndex',
  LastViewedStepId = 'lastViewedStepId',
  LastViewedChecklistName = 'lastViewedChecklistName',
  LastViewedProjectName = 'lastViewedProjectName',
  LastViewedProjectId = 'lastViewedProjectId',
  InterestAreas = 'interestAreas',
  InterestLevels = 'interestLevels',
  CompanyName = 'name',
  CompanyDescription = 'description',
  CompanyLogo = 'logo',
  CompanyLinkedin = 'linkedin',
  CompanyIndustry = 'industry',
  CompanyIndustryGroup = 'industryGroup',
  CompanySubIndustry = 'subIndustry',
  CompanySize = 'size',
  CompanyDomain = 'domain',
  CompanyCity = 'city',
  CompanyState = 'state',
  CompanyCountry = 'country',
  CompanyPostalCode = 'postalCode',
  CompanyEstimatedAnnualRevenue = 'estimatedAnnualRevenue',
  CompanyTechnologyStack = 'technologyStack',
  CompanyConfidenceScore = 'confidenceScore',
  CompanyEmployeeCount = 'employeeCount',
  CompanyAmountRaised = 'amountRaised',
  CompanySector = 'sector',
  CompanyTrafficRank = 'trafficRank',
  CompanyFoundedYear = 'foundedYear',
  HubspotCookie = 'hubspotCookie',
  MarketoCookie = 'marketoCookie',
}

export interface NavatticEventDataProperty {
  captureMethod: NavatticCaptureMethod;
  object: NavatticObject;
  source: NavatticAttributeSource;
  name: string;
  value: string;
}

export interface NavatticClientSideMetadata {
  browser: string;
  browser_version: string;
  current_url: string;
  device: string;
  gclid?: string;
  host: string;
  os: string;
  pathname: string;
  query_strings: object;
  referrer: string;
  referring_domain: string;
  screen_height: number;
  screen_width: number;
}

export type NavatticEventData =
  | BaseNavatticEventData
  | NavatticNavigateEventData;

/**
 * Interface describing the expected payload of an event
 * emitted by a Navattic iframe.
 */
export interface BaseNavatticEventData {
  /**
   * The type of the event.
   */
  type: NavatticEventType;

  /**
   * Project associated with the Navattic demo.
   */
  project: NavatticProject;

  /**
   * Flow that the user is currently in.
   */
  flow: NavatticFlow;

  /**
   * Current step of the flow the user is currently in.
   */
  step: NavatticStep;

  /**
   * If there is a checklist in the current project, the
   * data associated with that checklist.
   */
  checklist?: NavatticChecklist;

  /**
   * If there is a checklist and the user is currently on the
   * checklist, the current task from that list.
   */
  task?: NavatticTask;

  /**
   * IDs of tasks already completed by the user at this point.
   */
  completions: string[];

  /**
   * ID of the customer accessing the demo. Shows up at the URL:
   * https://app.navattic.com/your-workspace/customers/{customerId}
   */
  customerId: string;

  /**
   * ID of the user's current Navattic session.
   */
  sessionId: string;

  /**
   * Metadata about the user's device, browser, etc.
   */
  clientSideMetadata: NavatticClientSideMetadata;

  /**
   * Attributes that have been identified for the user, grouped
   * by the source they come from, e.g. a form-fill.
   */
  eventAttributes: Record<NavatticAttributeSource, { [key: string]: any }>;

  /**
   * Data properties for the current end user, company account, etc.
   */
  properties?: NavatticEventDataProperty[];
}

export type NavatticNavigateEventData = BaseNavatticEventData & {
  type: NavatticEventType.NAVIGATE;

  /**
   * URL of the link that the visitor navigated to.
   */
  url: string;
};
