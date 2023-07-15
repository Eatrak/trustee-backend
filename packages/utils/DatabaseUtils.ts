import { drizzle, MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

import { DB_HOST, DB_PASSWORD, DB_USERNAME } from "env";

export default class DatabaseUtils {
    private static instance?: DatabaseUtils;
    private db: MySql2Database;

    /**
     * 
     * @returns Singleton istance of the Utils class.
     */
    public static getInstance() {
        if (!this.instance) {
            this.instance = new DatabaseUtils();
            this.instance.initConnection();
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

    public async initConnection() {
        const connection = await mysql.createConnection({
            host: DB_HOST,
            user: DB_USERNAME,
            password: DB_PASSWORD
        });
        this.db = drizzle(connection);
    }

    public getDB(): MySql2Database {
        return this.db;
    }
};
