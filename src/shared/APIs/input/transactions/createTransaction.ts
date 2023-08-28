export interface CreateTransactionBody {
    name: string;
    walletId: string;
    categories: string[];
    carriedOut: number;
    amount: number;
    isIncome: boolean;
}

export interface CreateTransactionInput {
    name: string;
    walletId: string;
    categories: string[];
    carriedOut: number;
    amount: number;
    isIncome: boolean;
    userId: string;
}
