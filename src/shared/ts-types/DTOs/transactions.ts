import { Transaction, TransactionCategory } from "@shared/schema";

export enum TransactionCategoriesViews {
    WITH_BALANCE = "with-balance",
    NORMAL = "normal",
}

export interface TransactionCategoryBalance extends TransactionCategory {
    income: number;
    expense: number;
}

export interface TransactionTableRow extends Transaction {
    currencyId: string;
    currencyCode: string;
    currencySymbol: string;
    walletName: string;
}
