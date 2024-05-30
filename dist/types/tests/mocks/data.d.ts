import { ActivityContext, ClientSession, PageProperties, UserAgentDataType } from 'types';
export declare const TEST_WRITE_KEY = "1234";
export declare const TEST_ANONYMOUS_USER_ID = "5678";
export declare const MockUTM: {
    source: string;
    medium: string;
    campaign: string;
    term: string;
    content: string;
};
export declare const MockQueryParams: {
    utm_source: string;
    utm_medium: string;
    utm_campaign: string;
    utm_term: string;
    utm_content: string;
};
export declare const MockUrlQuery: string;
export declare const testEnvironmentOptions: {
    url: string;
    referrer: string;
    userAgent: string;
};
export declare const MockUserAgentData: UserAgentDataType;
export declare const MockClientSession: (overrides?: Partial<ClientSession>) => ClientSession;
export declare const MockActivityContext: ActivityContext;
export declare const MockPageProperties: PageProperties;
//# sourceMappingURL=data.d.ts.map