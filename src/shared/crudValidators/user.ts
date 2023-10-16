export const updateUserSettingsInputRules = {
    userId: "required|string",
    updateInfo: {
        // Required since there are no other info that can be updated
        currencyId: "required|string",
    },
};
