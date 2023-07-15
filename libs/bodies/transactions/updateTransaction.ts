export interface UpdateTransactionBody {
    attributesForSearching: {
        transactionId: string,
        transactionTimestamp: number,
        walletId: string
    },
    updatedAttributes: {
        transactionName: string,
        walletId: string,
        categoryId: string,
        transactionTimestamp: number,
        transactionAmount: number,
        isIncome: boolean
    }
}

export interface UpdateTransactionInput extends UpdateTransactionBody {
    userId: string
}
