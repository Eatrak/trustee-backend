import type { Config } from "drizzle-kit";

import * as env from "./env/env.dev.json";

export default {
    schema: "./src/shared/schema.ts",
    out: "./drizzle",
    driver: "mysql2",
    dbCredentials: {
        connectionString: env.DB_URL,
    },
} satisfies Config;
