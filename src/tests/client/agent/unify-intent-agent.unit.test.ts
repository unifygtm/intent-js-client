import { mock, mockReset } from 'jest-mock-extended';
import { v4 as uuidv4 } from 'uuid';

import {
  IdentifyActivity,
  PageActivity,
  TrackActivity,
} from '../../../client/activities';
import { UnifyIntentAgent } from '../../../client/agent';
import { UnifyIntentContext } from '../../../types';
import { MockUnifyIntentContext } from '../../mocks/intent-context-mock';
import {
  DEFAULT_FORMS_IFRAME_ORIGIN,
  NAVATTIC_IFRAME_ORIGIN,
  NAVATTIC_USER_EMAIL_KEY,
  NAVATTIC_USER_EMAIL_PROPERTY,
  UNIFY_TRACK_CLICK_DATA_ATTR_SELECTOR_NAME,
} from '../../../client/agent/constants';
import { DefaultEventType } from '../../../client/agent/types/default';
import {
  NavatticAttributeSource,
  NavatticCaptureMethod,
  NavatticEventType,
  NavatticObject,
} from '../../../client/agent/types/navattic';
import {
  extractUnifyCapturePropertiesFromElement,
  getElementName,
  isActionableElement,
} from '../../../client/agent/utils';

const mockedPageActivity = mock(PageActivity.prototype);
const mockedIdentifyActivity = mock(IdentifyActivity.prototype);
const mockedTrackActivity = mock(TrackActivity.prototype);
jest.mock('../../../client/activities', () => ({
  ...jest.requireActual('../../../client/activities'),
  PageActivity: jest.fn().mockImplementation(() => mockedPageActivity),
  IdentifyActivity: jest.fn().mockImplementation(() => mockedIdentifyActivity),
  TrackActivity: jest.fn().mockImplementation(() => mockedTrackActivity),
}));

jest.mock('../../../client/agent/utils', () => ({
  ...jest.requireActual('../../../client/agent/utils'),
  isActionableElement: jest.fn(),
  getElementName: jest.fn(),
  extractUnifyCapturePropertiesFromElement: jest.fn(),
}));

const mockedIsActionableElement = jest.mocked(isActionableElement);
const mockedGetElementName = jest.mocked(getElementName);
const mockedExtractUnifyCapturePropertiesFromElement = jest.mocked(
  extractUnifyCapturePropertiesFromElement,
);

interface InputElementData {
  id: string;
  type: HTMLInputElement['type'];
  value?: string;
}

interface ButtomElementData {
  label: string;
  alwaysTrack?: boolean;
}

function mockDocumentWithInputs(inputs: InputElementData[]) {
  document.body.innerHTML = `
        <div>
            ${inputs.map(
              ({ id, type, value }) => `
                <input id="${id}" type="${type}" value="${value ?? ''}" />
            `,
            )}
        </div>
    `;
}

const MOCK_BUTTON_NAME = 'Button';

function mockDocumentWithButton(button?: ButtomElementData) {
  document.body.innerHTML = `
        <div>
          <button id="test-button" ${
            button?.alwaysTrack ? UNIFY_TRACK_CLICK_DATA_ATTR_SELECTOR_NAME : ''
          }>${button?.label ?? MOCK_BUTTON_NAME}</button>
        </div>
    `;
}

function getTestButton() {
  return document.getElementById('test-button');
}

const MOCK_BUTTON_INPUT: InputElementData = {
  id: 'button-input',
  type: 'button',
};
const MOCK_TEXT_INPUT_WITH_NON_EMAIL: InputElementData = {
  id: 'text-input-non-email',
  type: 'text',
  value: 'not-a-valid-email',
};
const MOCK_TEXT_INPUT_WITH_EMAIL: InputElementData = {
  id: 'text-input-with-email',
  type: 'text',
  value: 'solomon@unifygtm.com',
};
const MOCK_TEXT_INPUT_EMPTY: InputElementData = {
  id: 'text-input-empty',
  type: 'text',
};
const MOCK_EMAIL_INPUT_WITH_EMAIL: InputElementData = {
  id: 'email-input-with-email',
  type: 'email',
  value: 'austin@unifygtm.com',
};
const MOCK_EMAIL_INPUT_EMPTY: InputElementData = {
  id: 'email-input-empty',
  type: 'email',
  value: '',
};

describe('UnifyIntentAgent', () => {
  const mockContext: UnifyIntentContext = MockUnifyIntentContext();
  let agent: UnifyIntentAgent | null = null;

  afterEach(() => {
    agent?.stopAutoIdentify();
    agent?.stopAutoPage();
    agent?.stopAutoTrack();
  });

  beforeEach(() => {
    mockReset(mockContext.apiClient);
    mockReset(mockContext.identityManager);
    mockReset(mockContext.sessionManager);
    mockReset(mockedPageActivity);
    mockReset(mockedIdentifyActivity);
    mockReset(mockedTrackActivity);
  });

  describe('startAutoPage', () => {
    beforeEach(() => {
      agent = new UnifyIntentAgent({
        ...mockContext,
        clientConfig: { ...mockContext.clientConfig, autoPage: true },
      });
      mockReset(mockedPageActivity);
    });

    describe('history.pushState', () => {
      it('tracks page events for new pages', () => {
        history.pushState(
          {},
          '',
          `${location.protocol}//${location.hostname}/${uuidv4()}`,
        );
        expect(mockedPageActivity.track).toHaveBeenCalledTimes(1);
      });

      it('does not track page events for the same page', () => {
        history.pushState(
          {},
          '',
          `${location.protocol}//${location.hostname}${location.pathname}?someParam=True`,
        );
        expect(mockedPageActivity.track).not.toHaveBeenCalled();
      });
    });

    describe('history.replaceState', () => {
      it('tracks page events for new pages', () => {
        history.replaceState(
          {},
          '',
          `${location.protocol}//${location.hostname}/${uuidv4()}`,
        );
        expect(mockedPageActivity.track).toHaveBeenCalledTimes(1);
      });

      it('does not track page events for the same page', () => {
        history.replaceState(
          {},
          '',
          `${location.protocol}//${location.hostname}${location.pathname}?someParam=True`,
        );
        expect(mockedPageActivity.track).not.toHaveBeenCalled();
      });
    });
  });

  describe('startAutoIdentify', () => {
    describe('when there are no inputs in the DOM', () => {
      beforeEach(() => {
        mockDocumentWithInputs([]);
      });

      it('does not monitor any input elements', () => {
        agent = new UnifyIntentAgent(mockContext);
        agent.startAutoIdentify();
        expect(agent.__getMonitoredInputs().size).toEqual(0);
      });
    });

    describe('when there are only non-identity input elements in the DOM', () => {
      beforeEach(() => {
        mockDocumentWithInputs([MOCK_BUTTON_INPUT, MOCK_BUTTON_INPUT]);
      });

      it('does not monitor any input elements', () => {
        agent = new UnifyIntentAgent(mockContext);
        agent.startAutoIdentify();
        expect(agent.__getMonitoredInputs().size).toEqual(0);
      });
    });

    describe('when there are some identity input types in the DOM', () => {
      beforeEach(() => {
        mockReset(mockedIdentifyActivity);
      });

      it('monitors only identity input elements', () => {
        mockDocumentWithInputs([
          MOCK_BUTTON_INPUT,
          MOCK_EMAIL_INPUT_EMPTY,
          MOCK_TEXT_INPUT_EMPTY,
        ]);
        agent = new UnifyIntentAgent(mockContext);
        agent.startAutoIdentify();

        const monitoredInputs = Array.from(agent.__getMonitoredInputs());
        expect(monitoredInputs.length).toEqual(2);
        expect(
          monitoredInputs.find(
            (input) => input.id === MOCK_EMAIL_INPUT_EMPTY.id,
          ),
        ).toBeTruthy();
        expect(
          monitoredInputs.find(
            (input) => input.id === MOCK_TEXT_INPUT_EMPTY.id,
          ),
        ).toBeTruthy();
      });

      it('submits emails on valid input blur', () => {
        mockDocumentWithInputs([
          MOCK_EMAIL_INPUT_WITH_EMAIL,
          MOCK_TEXT_INPUT_WITH_EMAIL,
          MOCK_EMAIL_INPUT_EMPTY,
          MOCK_TEXT_INPUT_WITH_NON_EMAIL,
        ]);
        agent = new UnifyIntentAgent(mockContext);
        agent.startAutoIdentify();

        // No submitted emails before blur
        expect(agent.__getSubmittedEmails().size).toEqual(0);

        // Trigger blur events
        agent.__getMonitoredInputs().forEach((input) => {
          input.dispatchEvent(new window.FocusEvent('blur'));
        });

        // Verify emails submitted
        const submittedEmails = Array.from(agent.__getSubmittedEmails());
        expect(submittedEmails.length).toEqual(2);
        expect(
          submittedEmails.find(
            (email) => email === MOCK_EMAIL_INPUT_WITH_EMAIL.value,
          ),
        ).toBeTruthy();
        expect(
          submittedEmails.find(
            (email) => email === MOCK_TEXT_INPUT_WITH_EMAIL.value,
          ),
        ).toBeTruthy();
        expect(mockedIdentifyActivity.track).toHaveBeenCalledTimes(2);
      });

      it('submits emails when user presses Enter', () => {
        mockDocumentWithInputs([
          MOCK_EMAIL_INPUT_WITH_EMAIL,
          MOCK_TEXT_INPUT_WITH_EMAIL,
          MOCK_EMAIL_INPUT_EMPTY,
          MOCK_TEXT_INPUT_WITH_NON_EMAIL,
        ]);
        agent = new UnifyIntentAgent(mockContext);
        agent.startAutoIdentify();

        // No submitted emails before Enter
        expect(agent.__getSubmittedEmails().size).toEqual(0);

        // Trigger keydown events
        agent.__getMonitoredInputs().forEach((input) => {
          input.dispatchEvent(
            new window.KeyboardEvent('keydown', { key: 'Enter' }),
          );
        });

        // Verify emails submitted
        const submittedEmails = Array.from(agent.__getSubmittedEmails());
        expect(submittedEmails.length).toEqual(2);
        expect(
          submittedEmails.find(
            (email) => email === MOCK_EMAIL_INPUT_WITH_EMAIL.value,
          ),
        ).toBeTruthy();
        expect(
          submittedEmails.find(
            (email) => email === MOCK_TEXT_INPUT_WITH_EMAIL.value,
          ),
        ).toBeTruthy();
        expect(mockedIdentifyActivity.track).toHaveBeenCalledTimes(2);
      });

      it('does not submit emails when non-Enter key pressed', () => {
        mockDocumentWithInputs([
          MOCK_EMAIL_INPUT_WITH_EMAIL,
          MOCK_TEXT_INPUT_WITH_EMAIL,
          MOCK_EMAIL_INPUT_EMPTY,
          MOCK_TEXT_INPUT_WITH_NON_EMAIL,
        ]);
        agent = new UnifyIntentAgent(mockContext);
        agent.startAutoIdentify();

        // No submitted emails before key press
        expect(agent.__getSubmittedEmails().size).toEqual(0);

        // Trigger keydown events
        agent.__getMonitoredInputs().forEach((input) => {
          input.dispatchEvent(
            new window.KeyboardEvent('keydown', { key: 'Space' }),
          );
        });

        // Verify emails submitted
        expect(agent.__getSubmittedEmails().size).toEqual(0);
        expect(mockedIdentifyActivity.track).not.toHaveBeenCalled();
      });

      it('does not submit the same emails multiple times', () => {
        mockDocumentWithInputs([
          MOCK_EMAIL_INPUT_WITH_EMAIL,
          MOCK_TEXT_INPUT_WITH_EMAIL,
          MOCK_EMAIL_INPUT_EMPTY,
          MOCK_TEXT_INPUT_WITH_NON_EMAIL,
        ]);
        agent = new UnifyIntentAgent(mockContext);
        agent.startAutoIdentify();

        // No submitted emails before Enter
        expect(agent.__getSubmittedEmails().size).toEqual(0);

        // Trigger keydown events
        agent.__getMonitoredInputs().forEach((input) => {
          input.dispatchEvent(
            new window.KeyboardEvent('keydown', { key: 'Enter' }),
          );
        });

        // Verify emails submitted first time
        expect(agent.__getSubmittedEmails().size).toEqual(2);
        expect(mockedIdentifyActivity.track).toHaveBeenCalledTimes(2);

        // Clear mock so we can verify no submission next time
        mockedIdentifyActivity.track.mockClear();

        // Trigger keydown events for inputs again
        agent.__getMonitoredInputs().forEach((input) => {
          input.dispatchEvent(
            new window.KeyboardEvent('keydown', { key: 'Enter' }),
          );
        });

        // Verify emails not submitted again
        expect(agent.__getSubmittedEmails().size).toEqual(2);
        expect(mockedIdentifyActivity.track).not.toHaveBeenCalled();
      });
    });

    describe('third-party integration handlers', () => {
      describe('Default form messages', () => {
        let defaultFormEvent: MessageEventInit = {
          origin: DEFAULT_FORMS_IFRAME_ORIGIN,
          data: {
            event: DefaultEventType.FORM_PAGE_SUBMITTED,
            payload: { formId: 1234 },
          },
        };

        it('does not log an identify event without email from the event data', () => {
          agent = new UnifyIntentAgent(mockContext);
          agent.startAutoIdentify();

          defaultFormEvent.data.payload.email = null;
          window.dispatchEvent(new MessageEvent('message', defaultFormEvent));

          expect(mockedIdentifyActivity.track).not.toHaveBeenCalled();
          expect(agent.__getSubmittedEmails().size).toEqual(0);
        });

        it('logs an identify event when email included in data', () => {
          agent = new UnifyIntentAgent(mockContext);
          agent.startAutoIdentify();

          defaultFormEvent.data.payload.email = 'solomon@unifygtm.com';
          window.dispatchEvent(new MessageEvent('message', defaultFormEvent));

          expect(mockedIdentifyActivity.track).toHaveBeenCalledTimes(1);
          expect(agent.__getSubmittedEmails().size).toEqual(1);
        });
      });

      describe('Navattic demo messages', () => {
        let navatticDemoEvent: MessageEventInit;

        beforeEach(() => {
          navatticDemoEvent = {
            origin: NAVATTIC_IFRAME_ORIGIN,
            data: {
              type: NavatticEventType.IDENTIFY_USER,
              eventAttributes: {
                [NavatticAttributeSource.FORM]: {
                  [NAVATTIC_USER_EMAIL_KEY]: 'solomon@unifygtm.com',
                },
              },
            },
          };
        });

        it('does not log an identify event without email from the event data', () => {
          agent = new UnifyIntentAgent(mockContext);
          agent.startAutoIdentify();

          navatticDemoEvent.data.eventAttributes[NavatticAttributeSource.FORM] =
            {};
          window.dispatchEvent(new MessageEvent('message', navatticDemoEvent));

          expect(mockedIdentifyActivity.track).not.toHaveBeenCalled();
          expect(agent.__getSubmittedEmails().size).toEqual(0);
        });

        it('logs an identify event when email included in data', () => {
          agent = new UnifyIntentAgent(mockContext);
          agent.startAutoIdentify();

          navatticDemoEvent.data.eventAttributes[NavatticAttributeSource.FORM] =
            {
              [NAVATTIC_USER_EMAIL_KEY]: 'solomon@unifygtm.com',
            };
          window.dispatchEvent(new MessageEvent('message', navatticDemoEvent));

          expect(mockedIdentifyActivity.track).toHaveBeenCalledTimes(1);
          expect(agent.__getSubmittedEmails().size).toEqual(1);
        });

        it('prefers user email from FORM data source over others', () => {
          agent = new UnifyIntentAgent(mockContext);
          agent.startAutoIdentify();

          navatticDemoEvent.data.eventAttributes[NavatticAttributeSource.FORM] =
            {
              [NAVATTIC_USER_EMAIL_KEY]: 'solomon-form@unifygtm.com',
            };
          navatticDemoEvent.data.eventAttributes[
            NavatticAttributeSource.ENRICHMENT
          ] = {
            [NAVATTIC_USER_EMAIL_KEY]: 'solomon-enrichment@unifygtm.com',
          };
          window.dispatchEvent(new MessageEvent('message', navatticDemoEvent));

          expect(mockedIdentifyActivity.track).toHaveBeenCalledTimes(1);
          expect(agent.__getSubmittedEmails().size).toEqual(1);
          expect(
            agent.__getSubmittedEmails().entries().next().value?.[0],
          ).toEqual('solomon-form@unifygtm.com');
        });

        it('gets user email from other sources if FORM not available', () => {
          agent = new UnifyIntentAgent(mockContext);
          agent.startAutoIdentify();

          navatticDemoEvent.data.eventAttributes[NavatticAttributeSource.FORM] =
            {};
          navatticDemoEvent.data.eventAttributes[
            NavatticAttributeSource.ENRICHMENT
          ] = {
            [NAVATTIC_USER_EMAIL_KEY]: 'solomon-enrichment@unifygtm.com',
          };
          window.dispatchEvent(new MessageEvent('message', navatticDemoEvent));

          expect(mockedIdentifyActivity.track).toHaveBeenCalledTimes(1);
          expect(agent.__getSubmittedEmails().size).toEqual(1);
          expect(
            agent.__getSubmittedEmails().entries().next().value?.[0],
          ).toEqual('solomon-enrichment@unifygtm.com');
        });

        describe('other event types', () => {
          beforeEach(() => {
            navatticDemoEvent = {
              origin: NAVATTIC_IFRAME_ORIGIN,
              data: {
                type: NavatticEventType.VIEW_STEP,
                properties: [],
              },
            };
          });

          it('logs an identify event when email in properties', () => {
            agent = new UnifyIntentAgent(mockContext);
            agent.startAutoIdentify();

            navatticDemoEvent.data.properties = [
              {
                captureMethod: NavatticCaptureMethod.DEMO,
                object: NavatticObject.END_USER,
                source: NavatticAttributeSource.REDUCER,
                name: NAVATTIC_USER_EMAIL_PROPERTY,
                value: 'solomon@unifygtm.com',
              },
            ];
            window.dispatchEvent(
              new MessageEvent('message', navatticDemoEvent),
            );

            expect(mockedIdentifyActivity.track).toHaveBeenCalledTimes(1);
            expect(agent.__getSubmittedEmails().size).toEqual(1);
            expect(
              agent.__getSubmittedEmails().entries().next().value?.[0],
            ).toEqual('solomon@unifygtm.com');
          });

          it('does not log an identify event when email not in properties', () => {
            agent = new UnifyIntentAgent(mockContext);
            agent.startAutoIdentify();

            navatticDemoEvent.data.properties = [];
            window.dispatchEvent(
              new MessageEvent('message', navatticDemoEvent),
            );

            expect(mockedIdentifyActivity.track).toHaveBeenCalledTimes(0);
            expect(agent.__getSubmittedEmails().size).toEqual(0);
          });
        });
      });
    });
  });

  describe('startAutoTrack', () => {
    describe('auto-track clicks', () => {
      beforeEach(() => {
        mockDocumentWithButton();
        mockedIsActionableElement.mockReturnValue(false);
        mockedGetElementName.mockReturnValue(null);
      });

      describe('when element is actionable', () => {
        beforeEach(() => {
          mockedIsActionableElement.mockReturnValue(true);
        });

        describe('when element has valid name', () => {
          beforeEach(() => {
            mockedGetElementName.mockReturnValue(MOCK_BUTTON_NAME);
          });

          describe('when element matches selectors', () => {
            it('tracks element clicks', () => {
              agent = new UnifyIntentAgent(
                MockUnifyIntentContext({
                  autoTrackOptions: { clickTrackingSelectors: ['button'] },
                }),
              );
              agent.startAutoTrack();

              getTestButton()?.dispatchEvent(
                new MouseEvent('click', { bubbles: true }),
              );

              expect(mockedTrackActivity.track).toHaveBeenCalledTimes(1);
            });
          });

          describe('when element does not match selectors', () => {
            it('does not track element clicks', () => {
              agent = new UnifyIntentAgent(
                MockUnifyIntentContext({
                  autoTrackOptions: { clickTrackingSelectors: [] },
                }),
              );
              agent.startAutoTrack();

              getTestButton()?.dispatchEvent(
                new MouseEvent('click', { bubbles: true }),
              );

              expect(mockedTrackActivity.track).toHaveBeenCalledTimes(0);
            });

            it('tracks element clicks if element has click tracking attribute', () => {
              mockDocumentWithButton({ label: 'Test', alwaysTrack: true });

              agent = new UnifyIntentAgent(
                MockUnifyIntentContext({
                  autoTrackOptions: { clickTrackingSelectors: [] },
                }),
              );
              agent.startAutoTrack();
              expect(mockedTrackActivity.track).not.toHaveBeenCalled();

              getTestButton()?.dispatchEvent(
                new MouseEvent('click', { bubbles: true }),
              );

              expect(mockedTrackActivity.track).toHaveBeenCalledTimes(1);
            });
          });
        });

        describe('when element does not have valid name', () => {
          beforeEach(() => {
            mockedGetElementName.mockReturnValue(null);
          });

          it('does not track element clicks', () => {
            agent = new UnifyIntentAgent(
              MockUnifyIntentContext({
                autoTrackOptions: { clickTrackingSelectors: ['button'] },
              }),
            );
            agent.startAutoTrack();

            getTestButton()?.dispatchEvent(
              new MouseEvent('click', { bubbles: true }),
            );

            expect(mockedTrackActivity.track).toHaveBeenCalledTimes(0);
          });
        });
      });

      describe('when element is not actionable', () => {
        beforeEach(() => {
          mockedIsActionableElement.mockReturnValue(false);
        });

        describe('when element has valid name', () => {
          beforeEach(() => {
            mockedGetElementName.mockReturnValue(MOCK_BUTTON_NAME);
          });

          it('does not track element clicks', () => {
            agent = new UnifyIntentAgent(
              MockUnifyIntentContext({
                autoTrackOptions: { clickTrackingSelectors: ['button'] },
              }),
            );
            agent.startAutoTrack();

            getTestButton()?.dispatchEvent(
              new MouseEvent('click', { bubbles: true }),
            );

            expect(mockedTrackActivity.track).toHaveBeenCalledTimes(0);
          });
        });
      });
    });
  });
});
