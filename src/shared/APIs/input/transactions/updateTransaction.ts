export interface UpdateTransactionPathParameters {
    id: string;
}

export interface UpdateTransactionBody {
    updateInfo: {
        name: string;
        walletId: string;
        categoryId: string;
        amount: number;
        isIncome: boolean;
        carriedOut: number;
    };
}

export interface UpdateTransactionInput
    extends UpdateTransactionBody,
        UpdateTransactionPathParameters {
    userId: string;
}
