import { User } from "@shared/schema";
import { Response } from "@shared/errors/types";

export interface SignUpResponseData {
    createdUser: User;
}

export type SignUpResponse = Response<SignUpResponseData>;
