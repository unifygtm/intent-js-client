/**
 * All possible event types emitted by Default.
 */
export enum DefaultEventType {
  FORM_COMPLETED = 'default.form_completed',
  FORM_PAGE_SUBMITTED = 'default.form_page_submitted',
  MEETING_BOOKED = 'default.meeting_booked',
  SCHEDULER_DISPLAED = 'default.scheduled_displayed',
}

/**
 * Union of all events which can be emitted by Default.
 */
export type DefaultEvent =
  | DefaultFormCompletedEvent
  | DefaultFormPageSubmittedEvent
  | DefaultMeetingBookedEvent
  | DefaultSchedulerDisplayedEvent;

/**
 * Event emitted when a form is completed.
 */
export interface DefaultFormCompletedEvent {
  event: DefaultEventType.FORM_COMPLETED;
  payload: DefaultFormEventPayload;
}

/**
 * Event emitted when a particular page of a form is completed.
 */
export interface DefaultFormPageSubmittedEvent {
  event: DefaultEventType.FORM_PAGE_SUBMITTED;
  payload: DefaultFormEventPayload;
}

/**
 * Event emitted when a meeting has been booked.
 */
export interface DefaultMeetingBookedEvent {
  event: DefaultEventType.MEETING_BOOKED;
  payload: DefaultMeetingBookedEventPayload;
}

/**
 * Event emitted when the meeting scheduler is displayed to a user.
 */
export interface DefaultSchedulerDisplayedEvent {
  event: DefaultEventType.SCHEDULER_DISPLAED;
  payload: DefaultSchedulerDisplayedEventPayload;
}

export interface DefaultFormEventPayload {
  /**
   * The email of the user who submitted the form.
   */
  email: string;

  /**
   * The ID of the form.
   */
  formId: string;

  /**
   * The name of the form.
   */
  formName: string;

  /**
   * The number of the page which the form was submitted on.
   */
  pageNumber: number;

  /**
   * The date and time that the form was submitted.
   */
  submittedAt: string;

  /**
   * List of user responses from the form.
   */
  responses: string[];

  /**
   * Lead attribute data from the user responses.
   */
  attributes: DefaultLeadAttributes;
}

export interface DefaultSchedulerDisplayedEventPayload {
  /**
   * The email of the user to whom the scheduler was displayed.
   */
  email: string;

  /**
   * The ID of the form.
   */
  formId: string;

  /**
   * The date and time that the scheduler was displayed at.
   */
  displayedAt: string;
}

export interface DefaultMeetingBookedEventPayload {
  /**
   * The ID of the meeting which was booked.
   */
  id: string;

  /**
   * The full name of the team member who the meeting was booked with.
   */
  memberName: string;

  /**
   * The email of the team member who the meeting was booked with.
   */
  memberEmail: string;

  /**
   * The email of the person who booked the meeting.
   */
  leadEmail: string;

  /**
   * The duration of the booked meeting in minutes.
   */
  durationInMinutes: number;

  /**
   * The start date and time of the booked meeting.
   */
  startDateTime: string;

  /**
   * The title of the booked meeting.
   */
  title: string;

  /**
   * The date and time that the meeting was booked at.
   */
  bookedAt: string;
}

/**
 * Standardized attributes associated with the person
 * filling out a Default form.
 */
export interface DefaultLeadAttributes {
  /**
   * First name of the lead.
   */
  first_name?: string;

  /**
   * Last name of the lead.
   */
  last_name?: string;

  /**
   * Phone number of the lead.
   */
  phone?: string;

  /**
   * Job title of the lead.
   */
  title?: string;

  /**
   * Job role of the lead.
   */
  role?: string;

  /**
   * Job seniority level of the lead.
   */
  seniority?: string;

  /**
   * Name of the company associated with the lead.
   */
  company?: string;

  /**
   * Website of the company associated with the lead.
   */
  website?: string;

  /**
   * URL of the company logo associated with the lead.
   */
  logo?: string;

  /**
   * City where the company associated with the lead is located.
   */
  city?: string;

  /**
   * Full location of the company associated with the lead.
   */
  location?: string;

  /**
   * Industry group of the company associated with the lead.
   */
  industry_group?: string;

  /**
   * ARR of the company associated with the lead.
   */
  arr?: string;

  /**
   * Number of employees at the company associated with the lead.
   */
  head_count?: string;

  /**
   * Funding amount of the company associated with the lead.
   */
  funding?: string;

  /**
   * Other tags for the company associated with the lead.
   */
  company_tags?: string;
}
