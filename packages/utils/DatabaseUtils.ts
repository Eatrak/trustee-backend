import { createConnection } from "@typedorm/core";
import { DocumentClientV3 } from "@typedorm/document-client";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { Transaction } from "entities/transaction";
import { Wallet } from "entities/wallet";
import { mainTable } from "tables/main";

export default class DatabaseUtils {
    private static instance?: DatabaseUtils;

    /**
     * 
     * @returns Singleton istance of the Utils class.
     */
    public static getInstance() {
        if (!this.instance) {
            this.instance = new DatabaseUtils();
        }

        return this.instance;
    }

    /**
     * 
     * @returns DynamoDB table name.
     */
     public getTableName(): string {
        if (!process.env.STAGE) throw new Error("STAGE environment variable is missing");

        return `trustee-${process.env.STAGE}`;
    }

    public initTypeDormConnection() {
        const documentClient = new DocumentClientV3(new DynamoDBClient({}));
        createConnection({
            table: mainTable,
            entities: [
                Transaction,
                Wallet
            ],
            documentClient
        });
    }
};
