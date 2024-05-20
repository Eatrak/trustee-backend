import { drizzle, MySql2Client, MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { Err, Ok, Result } from "ts-results";
import Validator from "validatorjs";
import { MysqlErrorCodes as sqlErrors } from "@shared/ts-types/mySqlErrorCodes";

import { EnvironmentConfiguration } from "@ts-types/environment";
import ErrorType from "@shared/errors/list";
import { initDBConnectionRules } from "@crudValidators/database";

export default class DatabaseUtils {
    private static instance?: DatabaseUtils;
    private db: MySql2Database;
    private dbConnection: MySql2Client;

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

        return "trustee";
    }

    public async initConnection(): Promise<Result<undefined, ErrorType>> {
        try {
            const { DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_PORT } =
                process.env as unknown as EnvironmentConfiguration;
            const validation = new Validator(process.env, initDBConnectionRules);
            if (validation.fails()) {
                console.log(validation.errors);

                return Err(ErrorType.DB_INITIALIZATION);
            }

            const connection = await mysql.createConnection({
                host: DB_HOST,
                user: DB_USERNAME,
                password: DB_PASSWORD,
                database: DB_NAME,
                port: DB_PORT,
            });
            this.dbConnection = connection;
            this.db = drizzle(connection);

            return Ok(undefined);
        } catch (err) {
            console.log(err);
            return Err(ErrorType.UNKNOWN);
        }
    }

    public getDB(): MySql2Database {
        return this.db;
    }

    public getDBConnection(): MySql2Client {
        return this.dbConnection;
    }

    public getErrorCodeFromSQLError(sqlErrorNumber: number): ErrorType {
        try {
            switch (sqlErrorNumber) {
                case sqlErrors.ER_DUP_ENTRY:
                    return ErrorType.DUPLICATE_ENTRY;
                case sqlErrors.ER_NO_REFERENCED_ROW_2:
                    return ErrorType.UNEXISTING_RESOURCE_TO_REFERENCE;
                default:
                    return ErrorType.UNKNOWN;
            }
        } catch (err) {
            console.log(err);
            return ErrorType.UNKNOWN;
        }
    }
}
