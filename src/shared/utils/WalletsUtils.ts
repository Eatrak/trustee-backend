import { Ok, Err, Result } from "ts-results";
import { eq } from "drizzle-orm";

import DatabaseUtils from "./DatabaseUtils";
import { Wallet, wallets } from "@shared/schema";
import ErrorType from "@shared/errors/list";

export type Errors = "UNEXISTING_RESOURCE" | "GENERAL";

export default class WalletsUtils {
    /**
     * Get user wallets.
     *
     * @param userId ID of the user that owns the wallets.
     * @returns Result of the query used to get user wallets.
     */
    public static async getWallets(userId: string): Promise<Result<Wallet[], "GENERAL">> {
        try {
            const result = await DatabaseUtils.getInstance()
                .getDB()
                .select()
                .from(wallets)
                .where(eq(wallets.userId, userId));

            return Ok(result);
        } catch (err) {
            console.log(err);
            return Err("GENERAL");
        }
    }

    public static async createWallet(
        id: string,
        userId: string,
        name: string,
        currencyId: string,
    ): Promise<Result<Wallet, ErrorType>> {
        try {
            const walletToCreate: Wallet = {
                id,
                name,
                userId,
                currencyId,
            };
            await DatabaseUtils.getInstance()
                .getDB()
                .insert(wallets)
                .values(walletToCreate);

            return Ok(walletToCreate);
        } catch (err) {
            console.log(err);
            return Err(ErrorType.WALLETS__CREATE__GENERAL);
        }
    }
}
