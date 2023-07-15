import type { Config } from "drizzle-kit";

import { DB_URL } from "./env";
 
export default {
  schema: "./schema.ts",
  out: "./drizzle",
  driver: 'mysql2',
  dbCredentials: {
    connectionString: DB_URL
  }
} satisfies Config;
