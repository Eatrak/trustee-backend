export interface GetTransactionsInputQueryParams {
    startCarriedOut: string;
    endCarriedOut: string;
    currencyCode: string;
}

export interface GetTransactionsInput {
    startCarriedOut: string;
    endCarriedOut: string;
    userId: string;
    currencyCode: string;
}
