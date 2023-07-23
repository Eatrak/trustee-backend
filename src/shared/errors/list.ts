import { getErrorType } from ".";

enum ErrorType {
    AUTH__SIGN_UP__DATA_VALIDATION = getErrorType(400, "00001"),
    AUTH__SIGN_UP__COGNITO_USER_CREATION = getErrorType(500, "00002"),
    AUTH__SIGN_UP__COGNITO_USER_PASSWORD_SETTING = getErrorType(500, "00003"),
    AUTH__SIGN_UP__DB_USER_CREATION = getErrorType(500, "00004"),
    WALLETS__CREATE__GENERAL = getErrorType(500, "00005"),
    GENERAL__DB__INITIALIZATION = getErrorType(500, "00006"),
    GENERAL__SERVER = getErrorType(500, "00007"),
}

export default ErrorType;
