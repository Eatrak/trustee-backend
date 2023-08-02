import { Ok, Err, Result } from "ts-results";
import { and, eq } from "drizzle-orm";

import DatabaseUtils from "./DatabaseUtils";
import { Wallet, wallets } from "@shared/schema";
import ErrorType from "@shared/errors/list";
import { UpdateWalletUpdateInfo } from "@APIs/input/transactions/updateWallet";

export default class WalletsUtils {
    /**
     * Get user wallets.
     *
     * @param userId ID of the user that owns the wallets.
     * @returns Result of the query used to get user wallets.
     */
    public static async getWallets(userId: string): Promise<Result<Wallet[], ErrorType>> {
        try {
            const result = await DatabaseUtils.getInstance()
                .getDB()
                .select()
                .from(wallets)
                .where(eq(wallets.userId, userId));

            return Ok(result);
        } catch (err) {
            console.log(err);
            return Err(ErrorType.WALLETS__GET__GENERAL);
        }
    }

    public static async createWallet(
        id: string,
        userId: string,
        name: string,
    ): Promise<Result<Wallet, ErrorType>> {
        try {
            const walletToCreate: Wallet = {
                id,
                name,
                userId,
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

    /**
     * Permanently delete a wallet.
     *
     * @param id ID of the wallet to delete.
     * @returns A Result.
     */
    public static async deleteWallet(id: string): Promise<Result<undefined, ErrorType>> {
        try {
            await DatabaseUtils.getInstance()
                .getDB()
                .delete(wallets)
                .where(eq(wallets.id, id));

            return Ok(undefined);
        } catch (err) {
            console.log(err);
            return Err(ErrorType.WALLETS__DELETE__GENERAL);
        }
    }

    public static async updateWallet(
        id: string,
        userId: string,
        updateInfo: UpdateWalletUpdateInfo,
    ): Promise<Result<undefined, ErrorType>> {
        try {
            const { name } = updateInfo;

            await DatabaseUtils.getInstance()
                .getDB()
                .update(wallets)
                .set({
                    name,
                })
                .where(and(eq(wallets.id, id), eq(wallets.userId, userId)));

            return Ok(undefined);
        } catch (err) {
            console.log(err);
            return Err(ErrorType.WALLETS__UPDATE__GENERAL);
        }
    }
}
