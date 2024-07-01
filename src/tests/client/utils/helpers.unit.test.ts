import { getLocationHrefWithCustomPath } from '../../../client/utils/helpers';

const TEST_CUSTOM_PATH = '/some-custom-path';

describe('helpers', () => {
  describe('getLocationHrefWithCustomPath', () => {
    it('correctly replaces href pathname with custom pathname', () => {
      const TEST_LOCATION = { ...window.location };
      TEST_LOCATION.href = 'https://www.unifygtm.com/pricing?searchParam=3';
      TEST_LOCATION.pathname = '/pricing';

      const result = getLocationHrefWithCustomPath({
        location: TEST_LOCATION,
        pathname: TEST_CUSTOM_PATH,
      });
      expect(result).toEqual(
        'https://www.unifygtm.com/some-custom-path?searchParam=3',
      );
    });

    it('correctly replaces href pathname with custom pathname for localhost', () => {
      const TEST_LOCATION = { ...window.location };
      TEST_LOCATION.href = 'http://localhost:8000/pricing?searchParam=3';
      TEST_LOCATION.pathname = '/pricing';

      const result = getLocationHrefWithCustomPath({
        location: TEST_LOCATION,
        pathname: TEST_CUSTOM_PATH,
      });
      expect(result).toEqual(
        'http://localhost:8000/some-custom-path?searchParam=3',
      );
    });

    it('correctly replaces href pathname with custom pathname for root path', () => {
      const TEST_LOCATION = { ...window.location };
      TEST_LOCATION.href = 'https://www.unifygtm.com/';
      TEST_LOCATION.pathname = '/';

      const result = getLocationHrefWithCustomPath({
        location: TEST_LOCATION,
        pathname: TEST_CUSTOM_PATH,
      });
      expect(result).toEqual('https://www.unifygtm.com/some-custom-path');
    });

    it('correctly replaces href pathname with custom pathname for empty path', () => {
      const TEST_LOCATION = { ...window.location };
      TEST_LOCATION.href = 'https://www.unifygtm.com';
      TEST_LOCATION.pathname = '';

      const result = getLocationHrefWithCustomPath({
        location: TEST_LOCATION,
        pathname: TEST_CUSTOM_PATH,
      });
      expect(result).toEqual('https://www.unifygtm.com/some-custom-path');
    });
  });
});
