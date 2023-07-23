import Validator from "validatorjs";

export const initDBConnectionRules: Validator.Rules = {
    DB_NAME: "required|string",
    DB_HOST: "required|string",
    DB_PASSWORD: "required|string",
    DB_PORT: "required|string",
    DB_USERNAME: "required|string",
};
