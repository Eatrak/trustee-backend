export interface UpdateWalletPathParameters {
    id: string;
}

export interface UpdateWalletUpdateInfo {
    name?: string;
    untrackedBalance?: number;
}

export interface UpdateWalletBody {
    updateInfo: UpdateWalletUpdateInfo;
}

export interface UpdateWalletInput extends UpdateWalletPathParameters, UpdateWalletBody {
    userId: string;
}
