import { Err, Ok, Result } from "ts-results";

import { Currency, currencies } from "@shared/schema";
import DatabaseUtils from "@utils/DatabaseUtils";
import ErrorType from "@shared/errors/list";

export default class CurrencyUtils {
    /**
     * Get currencies.
     *
     * @returns Currencies.
     */
    public static async getCurrencies(): Promise<Result<Currency[], ErrorType>> {
        try {
            const result = await DatabaseUtils.getInstance()
                .getDB()
                .select()
                .from(currencies);

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
}
