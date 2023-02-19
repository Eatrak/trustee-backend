/**
 * Validator for user sign-up.
 */
export const signUpValidator = {
    email: "required|email",
    password: "required|string|min:5|max:30"
};

/**
 * Validator for sign-up environment variables.
 */
export const signUpEnvironmentValidator = {
    USER_POOL_ID: "required|string"
};

/**
 * Validator for user sign-in.
 */
export const signInValidator = {
    email: "required|string",
    password: "required|string"
};

/**
 * Validator for sign-in environment variables.
 */
export const signInEnvironmentValidator = {
    USER_POOL_ID: "required|string",
    USER_POOL_CLIENT_ID: "required|string"
};
