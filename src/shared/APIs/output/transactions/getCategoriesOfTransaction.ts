import { Response } from "@shared/errors/types";
import { TransactionCategory } from "@shared/schema";

export interface GetCategoriesOfTransactionResponseData {
    transactionCategories: TransactionCategory[];
}

export type GetCategoriesOfTransactionResponse =
    Response<GetCategoriesOfTransactionResponseData>;
