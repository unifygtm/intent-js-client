import {
  getCurrentTopLevelDomain,
  isLocalStorageAvailable,
} from '../../../client/storage/utils';

const mockedSetItem = jest.mocked<typeof localStorage.setItem>(
  localStorage.setItem
);
const mockedRemoveItem = jest.mocked<typeof localStorage.removeItem>(
  localStorage.removeItem
);

describe('Storage Utils', () => {
  describe('isLocalStorageAvailable', () => {
    it('returns true when local storage works', () => {
      mockedSetItem.mockReturnValueOnce();
      mockedRemoveItem.mockReturnValueOnce();
      const isAvailable = isLocalStorageAvailable();
      expect(isAvailable).toEqual(true);
    });

    it('returns false when local storage throws', () => {
      mockedSetItem.mockImplementationOnce(() => {
        throw new Error();
      });
      const isAvailable = isLocalStorageAvailable();
      expect(isAvailable).toEqual(false);
    });
  });

  describe('getCurrentTopLevelDomain', () => {
    it('returns the same value for multiple subdomains', () => {
      const subdomains = [
        'app.unifygtm.com',
        'www.unifygtm.com',
        'unifygtm.com',
        'app.staging.unifygtm.com',
      ];
      subdomains.forEach((subdomain) =>
        expect(getCurrentTopLevelDomain(subdomain)).toEqual('unifygtm.com')
      );
    });
  });
});
