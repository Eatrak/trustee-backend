export const updateUserSettingsInputRules = {
    updateInfo: {
        currencyId: ["string", { required_if: ["updateInfo.language", undefined] }],
        language: ["string", { required_if: ["updateInfo.currencyId", undefined] }],
    },
};
