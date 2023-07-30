export interface CreateTransactionBody {
    name: string;
    walletId: string;
    categoryId: string;
    currencyId: string;
    carriedOut: number;
    amount: number;
    isIncome: boolean;
}

export interface CreateTransactionInput {
    name: string;
    walletId: string;
    categoryId: string;
    currencyId: string;
    carriedOut: number;
    amount: number;
    isIncome: boolean;
    userId: string;
}
