/**
 * Basic API client class for making requests to the Unify Intent API.
 */
export default class UnifyApiClient {
    private readonly _writeKey;
    constructor(writeKey: string);
    post: <TRequest extends object = object>(url: string, payload: TRequest) => void;
    private getAuthString;
}
//# sourceMappingURL=unify-api-client.d.ts.map