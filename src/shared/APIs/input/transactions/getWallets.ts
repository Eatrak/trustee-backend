import { WalletViews } from "@ts-types/DTOs/wallets";

export interface GetWalletsInputQueryParams {
    view?: WalletViews;
}

export interface GetWalletsInput {
    startCarriedOut: string;
    endCarriedOut: string;
    userId: string;
    currencyId: string;
}
