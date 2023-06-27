import "reflect-metadata";

import { Currency } from "entities/currency";
import DatabaseUtils from "./DatabaseUtils";

export default class CurrencyUtils {
    /**
     * Get currencies.
     *
     * @returns Currencies.
     */
    public static async getCurrencies() {
        const response = await DatabaseUtils.getInstance().getEntityManager().find(Currency, {});
        return response;
    }
}
