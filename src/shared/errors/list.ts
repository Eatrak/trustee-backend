import { getErrorType } from ".";

export enum ErrorType {
    WALLETS__CREATE__GENERAL = getErrorType(500, "0001"),
}
