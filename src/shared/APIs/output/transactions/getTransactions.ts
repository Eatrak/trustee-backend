import { Transaction } from "@shared/schema";
import { Response } from "@shared/errors/types";

export interface GetTransactionsResponseData {
    transactions: Transaction[];
    totalIncome: number;
    totalExpense: number;
}

export type GetTransactionsResponse = Response<GetTransactionsResponseData>;
