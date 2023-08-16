export const deleteWalletValidator = {
    id: "required|string",
    userId: "required|string",
};

export const createWalletInputRules = {
    name: "required|string",
    untrackedBalance: "required|numeric",
    currencyId: "required|string",
    userId: "required|string",
};

export const updateWalletInputRules = {
    id: "required|string",
    userId: "required|string",
    updateInfo: {
        name: ["string", { required_if: ["updateInfo.untrackedBalance", undefined] }],
        untrackedBalance: ["numeric", { required_if: ["updateInfo.name", undefined] }],
    },
};
