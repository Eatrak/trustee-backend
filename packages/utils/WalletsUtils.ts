import "reflect-metadata";
import { Ok, Err, Result } from "ts-results";

import { Wallet } from "entities/wallet";
import DatabaseUtils from "./DatabaseUtils";

export type Errors = "UNEXISTING_RESOURCE" | "GENERAL";

export default class WalletsUtils {
    /**
     * Get user wallets.
     *
     * @param userId ID of the user that owns the wallets.
     * @returns Result of the query used to get user wallets.
     */
    public static async getWallets(userId: string) {
        const response = await DatabaseUtils.getInstance().getEntityManager().find(Wallet, { userId }, {
            queryIndex: "GSI1"
        });
        return response;
    }

    public static async getWallet(
        userId: string,
        walletId: string
    ): Promise<Result<Wallet, Errors>> {
        try {
            const response = await DatabaseUtils.getInstance().getEntityManager().findOne(
                Wallet,
                { userId, walletId }
            );

            if (!response) {
                return new Err("UNEXISTING_RESOURCE");
            }

            return Ok(response);
        }
        catch (err) {
            console.log(err);
            return new Err("GENERAL");
        }
    }

    public static async createWallet(
        userId: string,
        walletName: string,
        currencyCode: string
    ): Promise<Wallet> {
        const newWallet = new Wallet();
        newWallet.userId = userId;
        newWallet.walletName = walletName;
        newWallet.currencyCode = currencyCode;

        const response: Wallet = await DatabaseUtils.getInstance().getEntityManager().create(newWallet);
        return response;
    }
}
