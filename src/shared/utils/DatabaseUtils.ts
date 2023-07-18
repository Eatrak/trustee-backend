import { drizzle, MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

import { env } from "@env/env.config";

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
            host: env.DB_HOST,
            user: env.DB_USERNAME,
            password: env.DB_PASSWORD,
            database: env.DB_NAME,
            port: env.DB_PORT,
        });
        this.db = drizzle(connection);
    }

    public getDB(): MySql2Database {
        return this.db;
    }
}
