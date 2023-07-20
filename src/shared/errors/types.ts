export interface ErrorResponseBodyAttributes {
    id: string;
    code: string;
    status: number;
}

export interface ErrorResponseBody {
    error: true;
    data: ErrorResponseBodyAttributes;
}

export interface SuccessfulResponseBody<T> {
    error: false;
    data: T;
}

export type Response<Data> = SuccessfulResponseBody<Data> | ErrorResponseBody;
