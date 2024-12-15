import { mock, mockReset } from 'jest-mock-extended';
import { v4 as uuidv4 } from 'uuid';

import { IdentifyActivity, PageActivity } from '../../../client/activities';
import { UnifyIntentAgent } from '../../../client/agent';
import { UnifyIntentContext } from '../../../types';
import { MockUnifyIntentContext } from '../../mocks/intent-context-mock';
import {
  DEFAULT_FORMS_IFRAME_ORIGIN,
  NAVATTIC_IFRAME_ORIGIN,
  NAVATTIC_USER_EMAIL_KEY,
  NAVATTIC_USER_EMAIL_PROPERTY,
} from '../../../client/agent/constants';
import { DefaultEventType } from '../../../client/agent/types/default';
import {
  NavatticAttributeSource,
  NavatticCaptureMethod,
  NavatticEventType,
  NavatticObject,
} from '../../../client/agent/types/navattic';

const mockedPageActivity = mock(PageActivity.prototype);
const mockedIdentifyActivity = mock(IdentifyActivity.prototype);
jest.mock('../../../client/activities', () => ({
  ...jest.requireActual('../../../client/activities'),
  PageActivity: jest.fn().mockImplementation(() => mockedPageActivity),
  IdentifyActivity: jest.fn().mockImplementation(() => mockedIdentifyActivity),
}));

interface InputElementData {
  id: string;
  type: HTMLInputElement['type'];
  value?: string;
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

  beforeEach(() => {
    mockReset(mockContext.apiClient);
    mockReset(mockContext.identityManager);
    mockReset(mockContext.sessionManager);
    mockReset(mockedPageActivity);
    mockReset(mockedIdentifyActivity);
  });

  describe('startAutoPage', () => {
    let agent: UnifyIntentAgent | null = null;

    beforeEach(() => {
      agent = new UnifyIntentAgent({
        ...mockContext,
        clientConfig: { ...mockContext.clientConfig, autoPage: true },
      });
      mockReset(mockedPageActivity);
    });

    afterEach(() => {
      agent?.stopAutoPage();
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
        const agent = new UnifyIntentAgent(mockContext);
        agent.startAutoIdentify();
        expect(agent.__getMonitoredInputs().size).toEqual(0);
        agent.stopAutoIdentify();
      });
    });

    describe('when there are only non-identity input elements in the DOM', () => {
      beforeEach(() => {
        mockDocumentWithInputs([MOCK_BUTTON_INPUT, MOCK_BUTTON_INPUT]);
      });

      it('does not monitor any input elements', () => {
        const agent = new UnifyIntentAgent(mockContext);
        agent.startAutoIdentify();
        expect(agent.__getMonitoredInputs().size).toEqual(0);
        agent.stopAutoIdentify();
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
        const agent = new UnifyIntentAgent(mockContext);
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

        agent.stopAutoIdentify();
      });

      it('submits emails on valid input blur', () => {
        mockDocumentWithInputs([
          MOCK_EMAIL_INPUT_WITH_EMAIL,
          MOCK_TEXT_INPUT_WITH_EMAIL,
          MOCK_EMAIL_INPUT_EMPTY,
          MOCK_TEXT_INPUT_WITH_NON_EMAIL,
        ]);
        const agent = new UnifyIntentAgent(mockContext);
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

        agent.stopAutoIdentify();
      });

      it('submits emails when user presses Enter', () => {
        mockDocumentWithInputs([
          MOCK_EMAIL_INPUT_WITH_EMAIL,
          MOCK_TEXT_INPUT_WITH_EMAIL,
          MOCK_EMAIL_INPUT_EMPTY,
          MOCK_TEXT_INPUT_WITH_NON_EMAIL,
        ]);
        const agent = new UnifyIntentAgent(mockContext);
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

        agent.stopAutoIdentify();
      });

      it('does not submit emails when non-Enter key pressed', () => {
        mockDocumentWithInputs([
          MOCK_EMAIL_INPUT_WITH_EMAIL,
          MOCK_TEXT_INPUT_WITH_EMAIL,
          MOCK_EMAIL_INPUT_EMPTY,
          MOCK_TEXT_INPUT_WITH_NON_EMAIL,
        ]);
        const agent = new UnifyIntentAgent(mockContext);
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

        agent.stopAutoIdentify();
      });

      it('does not submit the same emails multiple times', () => {
        mockDocumentWithInputs([
          MOCK_EMAIL_INPUT_WITH_EMAIL,
          MOCK_TEXT_INPUT_WITH_EMAIL,
          MOCK_EMAIL_INPUT_EMPTY,
          MOCK_TEXT_INPUT_WITH_NON_EMAIL,
        ]);
        const agent = new UnifyIntentAgent(mockContext);
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

        agent.stopAutoIdentify();
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
          const agent = new UnifyIntentAgent(mockContext);
          agent.startAutoIdentify();

          defaultFormEvent.data.payload.email = null;
          window.dispatchEvent(new MessageEvent('message', defaultFormEvent));

          agent.stopAutoIdentify();

          expect(mockedIdentifyActivity.track).not.toHaveBeenCalled();
          expect(agent.__getSubmittedEmails().size).toEqual(0);
        });

        it('logs an identify event when email included in data', () => {
          const agent = new UnifyIntentAgent(mockContext);
          agent.startAutoIdentify();

          defaultFormEvent.data.payload.email = 'solomon@unifygtm.com';
          window.dispatchEvent(new MessageEvent('message', defaultFormEvent));

          agent.stopAutoIdentify();

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
          const agent = new UnifyIntentAgent(mockContext);
          agent.startAutoIdentify();

          navatticDemoEvent.data.eventAttributes[NavatticAttributeSource.FORM] =
            {};
          window.dispatchEvent(new MessageEvent('message', navatticDemoEvent));

          agent.stopAutoIdentify();

          expect(mockedIdentifyActivity.track).not.toHaveBeenCalled();
          expect(agent.__getSubmittedEmails().size).toEqual(0);
        });

        it('logs an identify event when email included in data', () => {
          const agent = new UnifyIntentAgent(mockContext);
          agent.startAutoIdentify();

          navatticDemoEvent.data.eventAttributes[NavatticAttributeSource.FORM] =
            {
              [NAVATTIC_USER_EMAIL_KEY]: 'solomon@unifygtm.com',
            };
          window.dispatchEvent(new MessageEvent('message', navatticDemoEvent));

          agent.stopAutoIdentify();

          expect(mockedIdentifyActivity.track).toHaveBeenCalledTimes(1);
          expect(agent.__getSubmittedEmails().size).toEqual(1);
        });

        it('prefers user email from FORM data source over others', () => {
          const agent = new UnifyIntentAgent(mockContext);
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

          agent.stopAutoIdentify();

          expect(mockedIdentifyActivity.track).toHaveBeenCalledTimes(1);
          expect(agent.__getSubmittedEmails().size).toEqual(1);
          expect(
            agent.__getSubmittedEmails().entries().next().value[0],
          ).toEqual('solomon-form@unifygtm.com');
        });

        it('gets user email from other sources if FORM not available', () => {
          const agent = new UnifyIntentAgent(mockContext);
          agent.startAutoIdentify();

          navatticDemoEvent.data.eventAttributes[NavatticAttributeSource.FORM] =
            {};
          navatticDemoEvent.data.eventAttributes[
            NavatticAttributeSource.ENRICHMENT
          ] = {
            [NAVATTIC_USER_EMAIL_KEY]: 'solomon-enrichment@unifygtm.com',
          };
          window.dispatchEvent(new MessageEvent('message', navatticDemoEvent));

          agent.stopAutoIdentify();

          expect(mockedIdentifyActivity.track).toHaveBeenCalledTimes(1);
          expect(agent.__getSubmittedEmails().size).toEqual(1);
          expect(
            agent.__getSubmittedEmails().entries().next().value[0],
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
            const agent = new UnifyIntentAgent(mockContext);
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

            agent.stopAutoIdentify();

            expect(mockedIdentifyActivity.track).toHaveBeenCalledTimes(1);
            expect(agent.__getSubmittedEmails().size).toEqual(1);
            expect(
              agent.__getSubmittedEmails().entries().next().value[0],
            ).toEqual('solomon@unifygtm.com');
          });

          it('does not log an identify event when email not in properties', () => {
            const agent = new UnifyIntentAgent(mockContext);
            agent.startAutoIdentify();

            navatticDemoEvent.data.properties = [];
            window.dispatchEvent(
              new MessageEvent('message', navatticDemoEvent),
            );

            agent.stopAutoIdentify();

            expect(mockedIdentifyActivity.track).toHaveBeenCalledTimes(0);
            expect(agent.__getSubmittedEmails().size).toEqual(0);
          });
        });
      });
    });
  });
});
