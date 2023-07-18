export interface AuthorizerCustomClaims {
    userId: string;
}

export interface JsonWebKey {
    alg: string;
    e: string;
    kid: string;
    kty: string;
    n: string;
    use: string;
}
