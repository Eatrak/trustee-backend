import { Currency } from "@shared/schema";
import { Response } from "@shared/errors/types";

export interface GetCurrenciesResponseData {
    currencies: Currency[];
}

export type GetCurrenciesResponse = Response<GetCurrenciesResponseData>;
