import { v4 as uuid } from "uuid";

const ERROR_TYPE_ATTRIBUTES_SEPARATOR = "|";

const getErrorType = (status: number, code: string) => {
    return `${status}|${code}` as unknown as number;
};

export enum ErrorType {
    WALLETS__CREATE__GENERAL = getErrorType(500, "0001"),
}

class Error {
    private error: ErrorType;
    private id: string;

    constructor(error: ErrorType) {
        this.setId(uuid());
        this.error = error;
        this.log();
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

    log() {
        console.log(
            `[X] ERROR -> (
                id: ${this.getId()},
                code: ${this.getCode()},
                status: ${this.getStatus()}
            )`,
        );
    }
}

export default Error;
