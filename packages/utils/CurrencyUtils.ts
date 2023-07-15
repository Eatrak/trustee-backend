import "reflect-metadata";

import { Currency, currencies } from "schema";
import DatabaseUtils from "./DatabaseUtils";

export default class CurrencyUtils {
    /**
     * Get currencies.
     *
     * @returns Currencies.
     */
    public static async getCurrencies(): Promise<Currency[]> {
        return await DatabaseUtils
            .getInstance()
            .getDB()
            .select()
            .from(currencies);
    }
}
