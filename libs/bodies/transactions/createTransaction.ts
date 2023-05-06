export interface CreateTransactionBody {
    transactionName: string,
    walletId: string,
    categoryId: string,
    transactionTimestamp: number,
    transactionAmount: number,
    isIncome: boolean
}

export interface CreateTransactionInput {
    transactionName: string,
    walletId: string,
    categoryId: string,
    transactionTimestamp: number,
    transactionAmount: number,
    isIncome: boolean,
    userId: string
}
