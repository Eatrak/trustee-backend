export interface GetTransactionsByCurrencyAndCreationRangeInput {
    startCarriedOut: string;
    endCarriedOut: string;
    currencyCode: string;
    userId: string;
}
