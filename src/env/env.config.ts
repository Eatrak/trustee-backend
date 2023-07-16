import environments from "./env";

type EnvironmentName = "dev" | "prod";

interface EnvironmentVariables {
    DB_NAME: string,
    DB_USERNAME: string,
    DB_HOST: string,
    DB_PASSWORD: string,
    DB_PORT: number
}

export type Environments = {
    [environmentName in EnvironmentName]?: EnvironmentVariables;
};

export const currentEnvironmentName: EnvironmentName = "dev";

export const env = environments[currentEnvironmentName]!;

if (!env)
    throw new Error(`The environment with name "${currentEnvironmentName}" doesn't exist.`);

export const getDbUrl = () => {
    const {
        DB_USERNAME,
        DB_PASSWORD,
        DB_HOST,
        DB_PORT,
        DB_NAME
    } = env;

    return `mysql://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
};
