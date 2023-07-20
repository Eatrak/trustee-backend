import { v4 as uuid } from "uuid";

const ERROR_TYPE_ATTRIBUTES_SEPARATOR = "|";

const getErrorType = (status: number, code: string): number => {
    return Number.parseInt(`${status}|${code}`);
};

export enum ErrorType {
    WALLETS__CREATE__GENERAL = getErrorType(500, "0001"),
}

class Error {
    private error: ErrorType;
    private id: string;

    constructor(error: ErrorType) {
        this.error = error;
        this.setId(uuid());
        console.log(
            `Error:\n
            id: ${this.getId()}\n
            code: ${this.getCode()}\n
            status: ${this.getStatus()}\n`,
        );
    }

    private setId(id: string) {
        this.id = id;
    }

    getId() {
        return this.id;
    }

    getStatus() {
        return Number.parseInt(
            this.error.toString().split(ERROR_TYPE_ATTRIBUTES_SEPARATOR)[0],
        );
    }

    getCode() {
        return this.error.toString().split(ERROR_TYPE_ATTRIBUTES_SEPARATOR)[1];
    }
}

export default Error;
