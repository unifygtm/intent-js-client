import {
  UNIFY_CAPTURE_ATTRIBUTES_DATA_ATTR_PREFIX,
  UNIFY_ELEMENT_EXCLUSION_DATA_ATTR,
  UNIFY_ELEMENT_LABEL_DATA_ATTR,
} from '../../../client/agent/constants';
import {
  extractUnifyCapturePropertiesFromElement,
  getElementName,
  isActionableElement,
} from '../../../client/agent/utils';

describe('Unify Intent Agent utils', () => {
  describe('isActionableButton', () => {
    let button: HTMLButtonElement;

    beforeEach(() => {
      button = document.createElement('button');
    });

    afterEach(() => {
      button.remove();
    });

    it('returns true when element is actionable', () => {
      expect(isActionableElement(button)).toEqual(true);
    });

    it('returns false when element is hidden', () => {
      button.hidden = true;
      expect(isActionableElement(button)).toEqual(false);
    });

    it('returns false when element is aria hidden', () => {
      button.setAttribute('aria-hidden', 'true');
      expect(isActionableElement(button)).toEqual(false);
    });

    it('returns false when element is visually hidden', () => {
      button.style.display = 'none';
      expect(isActionableElement(button)).toEqual(false);
    });

    it('returns false when element is disabled', () => {
      button.disabled = true;
      expect(isActionableElement(button)).toEqual(false);
    });

    it('returns false when element is aria disabled', () => {
      button.setAttribute('aria-disabled', 'true');
      expect(isActionableElement(button)).toEqual(false);
    });

    it('returns false when element is excluded', () => {
      button.dataset[UNIFY_ELEMENT_EXCLUSION_DATA_ATTR] = 'true';
      expect(isActionableElement(button)).toEqual(false);
    });
  });

  describe('getElementName', () => {
    let button: HTMLButtonElement;
    let label: HTMLLabelElement;

    beforeEach(() => {
      button = document.createElement('button');
      button.dataset[UNIFY_ELEMENT_LABEL_DATA_ATTR] = 'Unify label';
      button.innerText = 'Inner text';
      button.textContent = 'Text content';
      button.setAttribute('aria-label', 'Aria label');
      button.setAttribute('aria-labelledby', 'label-id');
      document.body.appendChild(button);

      label = document.createElement('label');
      label.id = 'label-id';
      label.innerText = 'Label';
      document.body.appendChild(label);
    });

    afterEach(() => {
      button.remove();
      label.remove();
    });

    it('uses Unify data label first', () => {
      expect(getElementName(button)).toEqual('Unify label');
    });

    it('uses inner text next', () => {
      button.dataset[UNIFY_ELEMENT_LABEL_DATA_ATTR] = '';
      expect(getElementName(button)).toEqual('Inner text');
    });

    it('uses text content next', () => {
      button.dataset[UNIFY_ELEMENT_LABEL_DATA_ATTR] = '';
      button.innerText = '';
      expect(getElementName(button)).toEqual('Text content');
    });

    it('uses aria label next', () => {
      button.dataset[UNIFY_ELEMENT_LABEL_DATA_ATTR] = '';
      button.innerText = '';
      button.textContent = '';
      expect(getElementName(button)).toEqual('Aria label');
    });

    it('uses aria labelled by next', () => {
      button.dataset[UNIFY_ELEMENT_LABEL_DATA_ATTR] = '';
      button.innerText = '';
      button.textContent = '';
      button.setAttribute('aria-label', '');
      expect(getElementName(button)).toEqual('Label');
    });

    it('uses nested image alt next', () => {
      button.dataset[UNIFY_ELEMENT_LABEL_DATA_ATTR] = '';
      button.innerText = '';
      button.textContent = '';
      button.setAttribute('aria-label', '');
      button.setAttribute('aria-labelledby', '');

      const image = document.createElement('img');
      image.alt = 'Image alt';
      button.append(image);

      expect(getElementName(button)).toEqual('Image alt');
    });
  });

  describe('extractUnifyCapturePropertiesFromElement', () => {
    let button: HTMLButtonElement;

    beforeEach(() => {
      button = document.createElement('button');
    });

    afterEach(() => {
      button.remove();
    });

    it('returns an empty object if no extra attributes', () => {
      expect(extractUnifyCapturePropertiesFromElement(button)).toEqual({});
    });

    it('returns extra attributes when there are any', () => {
      button.dataset['unifyCaptureAttrCustomProperty'] = 'custom';
      button.dataset['unifyCaptureAttrAnotherProperty'] = 'another';
      expect(extractUnifyCapturePropertiesFromElement(button)).toEqual({
        customProperty: 'custom',
        anotherProperty: 'another',
      });
    });
  });
});
