import "reflect-metadata";

import DatabaseUtils from "./DatabaseUtils";
import { Currency } from "entities/currency";

export default class CurrencyUtils {
    static entityManager = DatabaseUtils.getInstance().getEntityManager("currencies");

    /**
     * Get currencies.
     *
     * @returns Currencies.
     */
    public static async getCurrencies() {
        const response = await this.entityManager.find(Currency, {});
        return response;
    }
}
