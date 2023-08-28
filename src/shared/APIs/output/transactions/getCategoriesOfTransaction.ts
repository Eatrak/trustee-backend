import { CategoryOfTransaction } from "@shared/schema";
import { Response } from "@shared/errors/types";

export interface GetCategoriesOfTransactionResponseData {
    categoriesOfTransaction: CategoryOfTransaction[];
}

export type GetCategoriesOfTransactionResponse =
    Response<GetCategoriesOfTransactionResponseData>;
