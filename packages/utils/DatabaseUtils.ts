import "reflect-metadata";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DocumentClientV3 } from '@typedorm/document-client';
import { createConnection, getEntityManager } from "@typedorm/core";

import { mainTable } from "tables/main";
import { Transaction } from "entities/transaction";
import { Wallet } from "entities/wallet";

export default class DatabaseUtils {
    private static instance?: DatabaseUtils;

    private constructor() {
        const documentClient = new DocumentClientV3(new DynamoDBClient({}));

        createConnection({
            table: mainTable,
            entities: [
                Wallet,
                Transaction
            ],
            documentClient
        });
    }

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
     * Establish a connection with the database and load
     * the entities for initializing the library used to perform
     * queries to the database.
     */
    public getEntityManager() {
        return getEntityManager();
    }

    /**
     * 
     * @returns DynamoDB table name.
     */
     public getTableName(): string {
        if (!process.env.STAGE) throw new Error("STAGE environment variable is missing");

        return `trustee-${process.env.STAGE}`;
    }
};
