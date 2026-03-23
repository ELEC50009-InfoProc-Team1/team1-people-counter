import bcrypt from "bcrypt";

/**
 * Check if some plaintext matches a hash.
 * @param plain The plaintext to check.
 * @param hash The hashed text to check.
 * @returns Whether the plain text matches the hashed text.
 */
export const compareHash = (plain: string, hash: string) => {
    return bcrypt.compareSync(plain, hash);
};
