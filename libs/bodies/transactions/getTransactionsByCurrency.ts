import { DocumentClientTypes } from "@typedorm/document-client";

export interface GetTransactionsByCurrencyInput {
    startCreationTimestamp?: string;
    endCreationTimestamp?: string;
    userId: string;
    cursor?: DocumentClientTypes.Key;
    currencyCode?: string;
}
