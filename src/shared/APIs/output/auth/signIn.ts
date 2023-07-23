import { Response } from "@shared/errors/types";

export interface SignInResponseData {
    authToken: string;
}

export type SignInResponse = Response<SignInResponseData>;
