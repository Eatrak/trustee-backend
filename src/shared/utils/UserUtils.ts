import { Err, Ok, Result } from "ts-results";
import { eq } from "drizzle-orm";

import { userSettings } from "@shared/schema";
import DatabaseUtils from "@utils/DatabaseUtils";
import ErrorType from "@shared/errors/list";
import { UpdateUserSettingsInput } from "@APIs/input/user/updateUserSettings";

export default class UserUtils {
    /**
     * Update user settings.
     */
    public static async updateUserSettings({
        userId,
        updateInfo,
    }: UpdateUserSettingsInput): Promise<Result<undefined, ErrorType>> {
        try {
            const { currencyId, language } = updateInfo;

            await DatabaseUtils.getInstance()
                .getDB()
                .update(userSettings)
                .set({ currencyId, language })
                .where(eq(userSettings.userId, userId));

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
