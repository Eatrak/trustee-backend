import { v4 as uuid } from "uuid";

const ERROR_TYPE_ATTRIBUTES_SEPARATOR = "|";

const getErrorType = (status: number, code: string): number => {
    return Number.parseInt(`${status}|${code}`);
};

export enum ErrorType {}

class Error {
    error: ErrorType;
    id: string;

    constructor(error: ErrorType) {
        this.error = error;
        this.setId(uuid());
    }

    private setId(id: string) {
        this.id = id;
    }

    getId() {
        return this.id;
    }

    getStatus() {
        return this.error.toString().split(ERROR_TYPE_ATTRIBUTES_SEPARATOR)[0];
    }

    getCode() {
        return this.error.toString().split(ERROR_TYPE_ATTRIBUTES_SEPARATOR)[1];
    }
}

export default Error;
