import { ITransaction } from "../../entities/transaction";

export interface GetTransactionsResponse {
    transactions: ITransaction[]
}
