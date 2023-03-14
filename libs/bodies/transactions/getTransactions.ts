import { DocumentClientTypes } from "@typedorm/document-client";

export interface GetTransactionsInputQueryParams {
    startCreationTimestamp?: string;
    endCreationTimestamp?: string;
    cursor?: string;
}

export interface GetTransactionsInput {
    startCreationTimestamp?: string;
    endCreationTimestamp?: string;
    userId: string;
    cursor?: DocumentClientTypes.Key;
}
