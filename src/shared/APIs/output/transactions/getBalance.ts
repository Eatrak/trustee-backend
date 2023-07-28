import { Response } from "@shared/errors/types";

export interface GetBalanceResponseData {
    totalIncome: number;
    totalExpense: number;
}

export type GetBalanceResponse = Response<GetBalanceResponseData>;
