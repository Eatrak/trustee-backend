/**
 * Body of the request body for the sign-up process.
 */
export interface SignUpBody {
    userInfo: {
        email: string,
        password: string
    }
};