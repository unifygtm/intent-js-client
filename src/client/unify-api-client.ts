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

    // Try to use the fetch API
    if (fetch) {
      fetch(url, {
        method: 'POST',
        body: requestBody,
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
          'X-Write-Key': this._writeKey,
        },
        keepalive: true,
      }).catch(() => undefined);
    } else {
      // Fall back to a good old XMLHTTPRequest if needed
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);
      xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8');
      xhr.setRequestHeader('X-Write-Key', this._writeKey);
      xhr.send(requestBody);
    }
  };
}
