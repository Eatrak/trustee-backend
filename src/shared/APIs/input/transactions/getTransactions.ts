export interface GetTransactionsInputQueryParams {
    startCarriedOut: string;
    endCarriedOut: string;
    currencyId: string;
}

export interface GetTransactionsInputMultiQueryParams {
    wallets: string[];
}

export interface GetTransactionsInput {
    startCarriedOut: string;
    endCarriedOut: string;
    userId: string;
    currencyId: string;
    wallets: string[];
}
