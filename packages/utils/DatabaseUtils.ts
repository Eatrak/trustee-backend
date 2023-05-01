import { EntityManager, createConnection, getEntityManager } from "@typedorm/core";
import { DocumentClientV3 } from "@typedorm/document-client";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { Transaction } from "entities/transaction";
import { TransactionCategory } from "entities/transactionCategory";
import { Wallet } from "entities/wallet";
import { Currency } from "entities/currency";
import { mainTable } from "tables/main";

type ObjectType<T> = (new () => T) | Function;
type EntityTarget<Entity> = ObjectType<Entity>;

type ConnectionName =
    "wallets" |
    "currencies" |
    "transactionCategories" |
    "transactions";

export default class DatabaseUtils {
    private static instance?: DatabaseUtils;
    private entityConnectionParams: {
        connectionName: ConnectionName,
        entityClass: EntityTarget<any>
    }[];
    
    constructor() {
        this.entityConnectionParams = [
            {
                connectionName: "wallets",
                entityClass: Wallet
            },
            {
                connectionName: "transactions",
                entityClass: Transaction
            },
            {
                connectionName: "currencies",
                entityClass: Currency
            },
            {
                connectionName: "transactionCategories",
                entityClass: TransactionCategory
            }
        ];
    }

    /**
     * 
     * @returns Singleton istance of the Utils class.
     */
    public static getInstance() {
        if (!this.instance) {
            this.instance = new DatabaseUtils();
            this.instance.initTypeDormConnections();
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

    public initTypeDormConnections() {
        const documentClient = new DocumentClientV3(new DynamoDBClient({}));

        this.entityConnectionParams.forEach(({ connectionName, entityClass }) => {
            createConnection({
                table: mainTable,
                name: connectionName,
                entities: [entityClass],
                documentClient
            });
        });
    }
    
    public getEntityManager(
        connectionName: ConnectionName
    ): EntityManager {
        return getEntityManager(connectionName);
    }
};
