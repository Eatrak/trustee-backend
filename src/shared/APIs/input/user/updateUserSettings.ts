export interface UpdateUserSettingsBody {
    updateInfo: {
        currencyId: string;
    };
}

export interface UpdateUserSettingsInput extends UpdateUserSettingsBody {
    userId: string;
}
