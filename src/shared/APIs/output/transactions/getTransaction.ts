import { Transaction } from "@shared/schema";
import { Response } from "@shared/errors/types";

export interface GetTransactionResponseData {
    transaction: Transaction;
}

export type GetTransactionResponse = Response<GetTransactionResponseData>;
