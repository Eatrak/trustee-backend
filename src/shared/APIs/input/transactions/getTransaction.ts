import { z } from "zod";

import {
    getTransactionInputSchema,
    getTransactionPathParametersSchema,
} from "@crudValidators/transactions";

export type GetTransactionPathParameters = z.infer<
    typeof getTransactionPathParametersSchema
>;

export type GetTransactionInput = z.infer<typeof getTransactionInputSchema>;
