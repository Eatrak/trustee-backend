import { Response } from "@shared/errors/types";
import { PersonalInfo } from "@ts-types/DTOs/auth";

export interface CheckAuthenticationResponseData {
    personalInfo: PersonalInfo;
}

export type CheckAuthenticationResponse = Response<CheckAuthenticationResponseData>;
