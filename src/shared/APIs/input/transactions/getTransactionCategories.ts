export interface GetTransactionCategoriesNormalInput {}

export interface GetTransactionCategoryBalancesInputQueryParams {
    startDate: number;
    endDate: number;
}

export interface GetTransactionCategoryBalancesInputMultiQueryParams {
    wallets: string[];
}

export interface GetTransactionCategoryBalancesInput
    extends GetTransactionCategoryBalancesInputQueryParams,
        GetTransactionCategoryBalancesInputMultiQueryParams {
    userId: string;
}
