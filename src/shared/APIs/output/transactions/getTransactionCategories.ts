import { Response } from "@shared/errors/types";
import { TransactionCategory } from "@shared/schema";
import {
    TransactionCategoriesViews,
    TransactionCategoryBalance,
} from "@ts-types/DTOs/transactions";

export interface GetNormalTransactionCategoriesResponseData {
    view: TransactionCategoriesViews.NORMAL;
    transactionCategories: TransactionCategory[];
}

export interface GetTransactionCategoryBalancesResponseData {
    view: TransactionCategoriesViews.WITH_BALANCE;
    transactionCategories: TransactionCategoryBalance[];
}

export type GetTransactionCategoriesResponse = Response<
    | GetNormalTransactionCategoriesResponseData
    | GetTransactionCategoryBalancesResponseData
>;
