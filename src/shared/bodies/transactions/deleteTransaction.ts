export interface DeleteTransactionQueryParameters {
    id: string;
}

export interface DeleteTransactionInput extends DeleteTransactionQueryParameters {
    userId: string;
}
