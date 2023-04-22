import "reflect-metadata";

import { Wallet } from "entities/wallet";
import DatabaseUtils from "./DatabaseUtils";

export default class WalletsUtils {
    static entityManager = DatabaseUtils.getInstance().getEntityManager("wallets");

    /**
     * Get user wallets.
     *
     * @param userId ID of the user that owns the wallets.
     * @returns Result of the query used to get user wallets.
     */
    public static async getWallets(userId: string) {
        const response = await this.entityManager.find(Wallet, { userId }, {
            queryIndex: "GSI1"
        });
        return response;
    }
}
