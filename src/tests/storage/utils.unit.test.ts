import { isLocalStorageAvailable } from '../../storage/utils';

const mockedSetItem = jest.mocked<typeof localStorage.setItem>(
  localStorage.setItem,
);
const mockedRemoveItem = jest.mocked<typeof localStorage.removeItem>(
  localStorage.removeItem,
);

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
