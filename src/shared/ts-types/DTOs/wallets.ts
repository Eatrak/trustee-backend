import { Wallet } from "@shared/schema";

export enum WalletViews {
    TABLE_ROW = "table-row",
    SUMMARY = "summary",
}

export interface WalletTableRow extends Wallet {
    net: number;
    income: number;
    expense: number;
    transactionsCount: number;
    // TODO: add creationDate attribute
    currencyCode: string;
}
