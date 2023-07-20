import { Result } from "ts-results";

import { Wallet } from "@shared/schema";
import Error from "@shared/errors";

export type CreateWalletResponse = Result<
    {
        createdWallet: Wallet;
    },
    Error
>;
