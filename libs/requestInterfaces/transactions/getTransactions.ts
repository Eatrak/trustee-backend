import { ITransaction } from "../../../packages/entities/transaction";

export interface GetTransactionsResponse {
    transactions: ITransaction[]
}
