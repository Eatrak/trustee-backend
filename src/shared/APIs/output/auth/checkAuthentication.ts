import jwt from "jsonwebtoken";

import { Response } from "@shared/errors/types";

export interface CheckAuthenticationResponseData {
    decodedAuthToken: string | jwt.JwtPayload;
}

export type CheckAuthenticationResponse = Response<CheckAuthenticationResponseData>;
