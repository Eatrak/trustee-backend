import { DocumentClientTypes } from "@typedorm/document-client";

export interface GetTransactionsInputQueryParams {
    startCreationTimestamp?: string;
    endCreationTimestamp?: string;
    cursor?: string;
    currencyCode?: string;
}

export interface GetTransactionsInput {
    startCreationTimestamp?: string;
    endCreationTimestamp?: string;
    userId: string;
    cursor?: DocumentClientTypes.Key;
    currencyCode?: string;
}
