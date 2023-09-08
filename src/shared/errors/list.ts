import { getErrorType } from ".";

enum ErrorType {
    ENV = getErrorType(400, "00001"),
    DATA_VALIDATION = getErrorType(400, "00002"),
    COGNITO_USER_CREATION = getErrorType(500, "00003"),
    COGNITO_USER_PASSWORD_SETTING = getErrorType(500, "00004"),
    DUPLICATE_ENTRY = getErrorType(409, "00005"),
    NOT_FOUND = getErrorType(404, "00006"),
    READING_GENERATED_ID_TOKEN = getErrorType(500, "00007"),
    UNAUTHORIZED = getErrorType(401, "00008"),
    DB_INITIALIZATION = getErrorType(500, "00009"),
    UNKNOWN = getErrorType(500, "00010"),
}

export default ErrorType;
