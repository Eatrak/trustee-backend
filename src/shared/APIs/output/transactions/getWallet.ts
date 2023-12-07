import { Wallet } from "@shared/schema";
import { Response } from "@shared/errors/types";

export interface GetWalletResponseData {
    wallet: Wallet;
}

export type GetWalletResponse = Response<GetWalletResponseData>;
