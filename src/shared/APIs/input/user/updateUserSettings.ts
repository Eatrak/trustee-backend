import { TranslationLanguage } from "@ts-types/generic/translations";

export interface UpdateUserSettingsBody {
    updateInfo: {
        currencyId: string;
        language: TranslationLanguage;
    };
}

export interface UpdateUserSettingsInput extends UpdateUserSettingsBody {
    userId: string;
}
