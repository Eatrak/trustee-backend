import { Wallet } from "@shared/schema";
import { Response } from "@shared/errors/types";

export type CreateWalletResponse = Response<{ createdWallet: Wallet }>;
