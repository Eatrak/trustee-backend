export interface TotalIncomeByCurrency {
    [currencyCode: string]: number;
}

export interface TotalExpenseByCurrency {
    [currencyCode: string]: number;
}

export interface CurrencyTotalBalance {
    totalIncome: number;
    totalExpense: number;
}
