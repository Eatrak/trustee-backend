import { z } from "zod";

import {
    updateTransactionBodySchema,
    updateTransactionInputSchema,
    updateTransactionPathParametersSchema,
} from "@crudValidators/transactions";

export type UpdateTransactionPathParameters = z.infer<
    typeof updateTransactionPathParametersSchema
>;
export type UpdateTransactionBody = z.infer<typeof updateTransactionBodySchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionInputSchema>;
