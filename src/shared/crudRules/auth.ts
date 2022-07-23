/**
 * Validator for user sign-up.
 */
export const signUpValidator = {
    email: "required|email",
    password: "required|string|min:5|max:30"
};

/**
 * Validation for creating the user.
 */
export const createUserEnvironmentValidation = {
    USER_POOL_ID: "required|string"
};

/**
 * Validation for getting the user.
 */
export const signInValidation = {
    email: "required|string",
    password: "required|string"
};

/**
 * Validation for creating the user.
 */
export const signInUserEnvironmentValidation = {
    USER_POOL_ID: "required|string",
    USER_POOL_CLIENT_ID: "required|string"
};
