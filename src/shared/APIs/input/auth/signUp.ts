/**
 * Body of the request body for the sign-up process.
 */
export interface SignUpBody {
    userInfo: {
        name: string;
        surname: string;
        email: string;
        password: string;
    };
}
