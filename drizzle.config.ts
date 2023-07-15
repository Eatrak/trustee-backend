import type { Config } from "drizzle-kit";

import { getDbUrl } from "./env.config";
 
export default {
  schema: "./schema.ts",
  out: "./drizzle",
  driver: 'mysql2',
  dbCredentials: {
    connectionString: getDbUrl()
  }
} satisfies Config;
