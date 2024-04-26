import { Ok, Err, Result } from "ts-results";
import { and, eq, sql } from "drizzle-orm";

import DatabaseUtils from "./DatabaseUtils";
import { Wallet, currencies, transactions, wallets } from "@shared/schema";
import ErrorType from "@shared/errors/list";
import { UpdateWalletUpdateInfo } from "@APIs/input/transactions/updateWallet";
import { WalletTableRow } from "@ts-types/DTOs/wallets";
import { MySql2Database } from "drizzle-orm/mysql2";

export default class WalletsUtils {
    /**
     * Get user wallets.
     *
     * @param userId ID of the user that owns the wallets.
     * @returns Result of the query used to get user wallets.
     */
    public static async getWalletsSummary(
        userId: string,
    ): Promise<Result<Wallet[], ErrorType>> {
        try {
            const result = await DatabaseUtils.getInstance()
                .getDB()
                .select()
                .from(wallets)
                .where(eq(wallets.userId, userId));

            return Ok(result);
        } catch (err) {
            console.log(err);
            return Err(
                DatabaseUtils.getInstance().getErrorCodeFromSQLError(
                    (err as { errno: number }).errno,
                ),
            );
        }
    }

    /**
     * Get user wallets to show in table.
     *
     * @param userId ID of the user that owns the wallets.
     * @returns Result of the query used to get user wallets.
     */
    public static async getWalletTableRows(
        userId: string,
        currencyId?: string,
    ): Promise<Result<WalletTableRow[], ErrorType>> {
        try {
            const whereConditions = [eq(wallets.userId, userId)];

            // If the currencyId is given, get only the wallets with the given currencyId;
            // otherwise, get all the wallets
            currencyId && whereConditions.push(eq(wallets.currencyId, currencyId));

            const result: WalletTableRow[] = await DatabaseUtils.getInstance()
                .getDB()
                .select({
                    id: wallets.id,
                    name: wallets.name,
                    userId: wallets.userId,
                    currencyId: wallets.currencyId,
                    untrackedBalance: wallets.untrackedBalance,
                    net: sql<number>`${wallets.untrackedBalance} + (sum(CASE WHEN ${transactions.isIncome} THEN ${transactions.amount} ELSE 0 END) - sum(CASE WHEN ${transactions.isIncome} THEN 0 ELSE ${transactions.amount} END))`,
                    income: sql<number>`sum(CASE WHEN ${transactions.isIncome} THEN ${transactions.amount} ELSE 0 END)`,
                    expense: sql<number>`sum(CASE WHEN ${transactions.isIncome} THEN 0 ELSE ${transactions.amount} END)`,
                    transactionsCount: sql<number>`count(${transactions.id})`,
                    currencyCode: currencies.code,
                })
                .from(wallets)
                .where(and(...whereConditions))
                .leftJoin(transactions, eq(wallets.id, transactions.walletId))
                .innerJoin(currencies, eq(wallets.currencyId, currencies.id))
                .groupBy(wallets.id);

            return Ok(result);
        } catch (err) {
            console.log(err);
            return Err(
                DatabaseUtils.getInstance().getErrorCodeFromSQLError(
                    (err as { errno: number }).errno,
                ),
            );
        }
    }

    public static async createWallet(
        id: string,
        userId: string,
        name: string,
        untrackedBalance: number,
        currencyId: string,
    ): Promise<Result<Wallet, ErrorType>> {
        try {
            const walletToCreate: Wallet = {
                id,
                name,
                currencyId,
                userId,
                untrackedBalance,
            };
            await DatabaseUtils.getInstance()
                .getDB()
                .insert(wallets)
                .values(walletToCreate);

            return Ok(walletToCreate);
        } catch (err) {
            console.log(err);
            return Err(
                DatabaseUtils.getInstance().getErrorCodeFromSQLError(
                    (err as { errno: number }).errno,
                ),
            );
        }
    }

    /**
     * Get a wallet.
     *
     * @param id ID of the wallet to get.
     * @returns A Result.
     */
    public static async getWallet(id: string): Promise<Result<Wallet, ErrorType>> {
        try {
            const wallet = await DatabaseUtils.getInstance()
                .getDB()
                .select()
                .from(wallets)
                .where(eq(wallets.id, id));

            return Ok(wallet[0]);
        } catch (err) {
            console.log(err);
            return Err(
                DatabaseUtils.getInstance().getErrorCodeFromSQLError(
                    (err as { errno: number }).errno,
                ),
            );
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
            return Err(
                DatabaseUtils.getInstance().getErrorCodeFromSQLError(
                    (err as { errno: number }).errno,
                ),
            );
        }
    }

    public static async isTheWalletOwnedByTheUser(
        db: MySql2Database,
        walletId: string,
        userId: string,
    ): Promise<Result<boolean, ErrorType>> {
        try {
            const wallet = await db
                .select()
                .from(wallets)
                .where(
                    and(
                        // Check if the wallet exists
                        eq(wallets.id, walletId),
                        // Check if the wallet belongs to the user
                        eq(wallets.userId, userId),
                    ),
                );

            return Ok(Boolean(wallet[0]));
        } catch (err) {
            console.log(err);
            return Err(
                DatabaseUtils.getInstance().getErrorCodeFromSQLError(
                    (err as { errno: number }).errno,
                ),
            );
        }
    }

    public static async updateWallet(
        id: string,
        userId: string,
        updateInfo: UpdateWalletUpdateInfo,
    ): Promise<Result<undefined, ErrorType>> {
        try {
            await DatabaseUtils.getInstance()
                .getDB()
                .update(wallets)
                .set(updateInfo)
                .where(and(eq(wallets.id, id), eq(wallets.userId, userId)));

            return Ok(undefined);
        } catch (err) {
            console.log(err);
            return Err(
                DatabaseUtils.getInstance().getErrorCodeFromSQLError(
                    (err as { errno: number }).errno,
                ),
            );
        }
    }
}
