import { Wallet } from "@shared/schema";
import { Response } from "@shared/errors/types";

export interface GetWalletsResponseData {
    wallets: Wallet[];
}

export type GetWalletsResponse = Response<GetWalletsResponseData>;
