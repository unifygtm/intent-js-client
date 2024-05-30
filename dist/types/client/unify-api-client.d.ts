/**
 * Basic API client class for making requests to the Unify Intent API.
 */
declare class UnifyApiClient {
    private readonly _writeKey;
    constructor(writeKey: string);
    post: <TRequest extends object = object>(url: string, payload: TRequest) => void;
    private getAuthString;
}
export default UnifyApiClient;
//# sourceMappingURL=unify-api-client.d.ts.map