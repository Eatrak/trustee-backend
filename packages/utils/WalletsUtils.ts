import "reflect-metadata";

import DatabaseUtils from './DatabaseUtils';
import { Wallet } from "entities/wallet";

export default class WalletsUtils {
    /**
     * Get user wallets.
     *
     * @param userId ID of the user that owns the wallets.
     * @returns Result of the query used to get user wallets.
     */
    public static async getWallets(userId: string) {
        const entityManager = DatabaseUtils.getInstance().getEntityManager();
        const response = await entityManager.find(Wallet, { userId }, {
            queryIndex: "GSI1"
        });
        return response;
    }
}
