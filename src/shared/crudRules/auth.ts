/**
 * Validation for creating the user.
 */
export const createUserValidation = {
    email: "required|string",
    password: "required|string"
};

/**
 * Validation for getting the user.
 */
export const signInValidation = {
    email: "required|string",
    password: "required|string"
};
