export interface DeleteTransactionQueryParameters {
    transactionId: string
}

export interface DeleteTransactionInput extends DeleteTransactionQueryParameters {
    userId: string
}
