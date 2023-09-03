export interface GetBalanceInputQueryParams {
    startCarriedOut: string;
    endCarriedOut: string;
    currencyId: string;
}

export interface GetBalanceInputMultiQueryParams {
    wallets: string[];
}

export interface GetBalanceInput
    extends GetBalanceInputQueryParams,
        GetBalanceInputMultiQueryParams {
    userId: string;
}
