export interface GetBalanceInputQueryParams {
    startCarriedOut: string;
    endCarriedOut: string;
    currencyId: string;
}

export interface GetBalanceInput {
    startCarriedOut: string;
    endCarriedOut: string;
    userId: string;
    currencyId: string;
}
