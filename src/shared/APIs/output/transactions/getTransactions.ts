import { Transaction } from "@shared/schema";

export interface GetTransactionsResponse {
    transactions: Transaction[];
}
