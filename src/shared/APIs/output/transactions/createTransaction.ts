import { Transaction } from "@shared/schema";
import { Response } from "@shared/errors/types";

export interface CreateTransactionResponseData {
    createdTransaction: Transaction;
}

export type CreateTransactionResponse = Response<CreateTransactionResponseData>;
