import { DocumentClientTypes } from "@typedorm/document-client";

import { ITransaction } from "../../../packages/entities/transaction";

export interface GetTransactionsResponse {
    transactions: ITransaction[],
    cursor?: DocumentClientTypes.Key
}
