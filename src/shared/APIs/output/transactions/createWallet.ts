import { Wallet } from "@shared/schema";
import { Response } from "@shared/errors/types";

export interface CreateWalletResponseData {
    createdWallet: Wallet;
}

export type CreateWalletResponse = Response<CreateWalletResponseData>;
