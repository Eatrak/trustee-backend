import type { Config } from "drizzle-kit";

import { env } from "@env/env.config";

export default {
    schema: "./src/shared/schema.ts",
    out: "./drizzle",
    driver: "mysql2",
    dbCredentials: {
        connectionString: env.DB_URL,
    },
} satisfies Config;
