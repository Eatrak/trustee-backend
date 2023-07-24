import { Response } from "@shared/errors/types";
import { TransactionCategory } from "@shared/schema";

export interface GetTransactionCategoriesResponseData {
    transactionCategories: TransactionCategory[];
}

export type GetTransactionCategoriesResponse =
    Response<GetTransactionCategoriesResponseData>;
