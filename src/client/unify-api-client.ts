import { encode } from 'js-base64';

/**
 * Basic API client class for making requests to the Unify Intent API.
 */
export default class UnifyApiClient {
  private readonly _writeKey: string;

  constructor(writeKey: string) {
    this._writeKey = writeKey;
  }

  public post = <TRequest extends object = object>(
    url: string,
    payload: TRequest,
  ) => {
    const requestBody = JSON.stringify(payload);
    const authHeader = this.getAuthString(this._writeKey);

    // Try to use the fetch API
    if (fetch) {
      fetch(url, {
        method: 'POST',
        body: requestBody,
        credentials: 'include',
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
          Authorization: this.getAuthString(this._writeKey),
        },
        keepalive: true,
      }).catch(() => undefined);
    } else {
      // Fall back to a good old XMLHTTPRequest if needed
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);
      xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8');
      xhr.setRequestHeader('Authorization', authHeader);
      xhr.send(requestBody);
    }
  };

  private getAuthString(writeKey: string): string {
    return `Basic ${encode(writeKey + ':')}`;
  }
}
