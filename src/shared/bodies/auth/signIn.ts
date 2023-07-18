/**
 * Body of the request body for the sign-up process.
 */
export interface SignInBody {
    userInfo: {
        email: string;
        password: string;
    };
}
