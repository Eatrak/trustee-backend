import { Response } from "@shared/errors/types";
import { TransactionCategory } from "@shared/schema";

export interface CreateTransactionCategoryResponseData {
    createdTransactionCategory: TransactionCategory;
}

export type CreateTransactionCategoryResponse =
    Response<CreateTransactionCategoryResponseData>;
