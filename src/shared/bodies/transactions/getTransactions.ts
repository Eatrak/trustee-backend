export interface GetTransactionsInputQueryParams {
    startCreationTimestamp?: string;
    endCreationTimestamp?: string;
}

export interface GetTransactionsInput extends GetTransactionsInputQueryParams {
    userId: string;
}
