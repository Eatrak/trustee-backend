import { Wallet } from "@shared/schema";
import { Response } from "@shared/errors/types";
import { WalletTableRow } from "@shared/ts-types/DTOs/wallets";

export interface GetWalletTableRowsResponseData {
    view: "table-row";
    wallets: WalletTableRow[];
}

export interface GetWalletsSummaryResponseData {
    view: "summary";
    wallets: Wallet[];
}

export type GetWalletTableRowsResponse = Response<GetWalletTableRowsResponseData>;
export type GetWalletsSummaryResponse = Response<GetWalletsSummaryResponseData>;

export type GetWalletsResponseData =
    | GetWalletTableRowsResponseData
    | GetWalletsSummaryResponseData;
export type GetWalletsResponse = Response<GetWalletsResponseData>;
