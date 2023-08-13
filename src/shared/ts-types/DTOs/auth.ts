import { Currency } from "@shared/schema";

interface PersonalInfoSettings {
    currency: Currency;
}

export interface PersonalInfo {
    name: string;
    surname: string;
    email: string;
    settings: PersonalInfoSettings;
}
