import { hash, compare } from 'bcryptjs';

/**
 * Hashes a plaintext password using bcrypt.
 * @param plainPassword - The plain text password to hash.
 * @param saltRounds - Optional. The cost factor (default: 12).
 * @returns Promise<string> - The hashed password.
 */
export async function hashPassword(
    plainPassword: string,
    saltRounds: number = 12
): Promise<string> {
    if (!plainPassword) throw new Error("Password is required");
    return await hash(plainPassword, saltRounds);
}

/**
 * Compares a plaintext password with a hashed password.
 * @param plainPassword - The plain text password to check.
 * @param hashedPassword - The stored hashed password.
 * @returns Promise<boolean> - True if passwords match, false otherwise.
 */
export async function verifyPassword(
    plainPassword: string,
    hashedPassword: string
): Promise<boolean> {
    if (!plainPassword || !hashedPassword) {
        throw new Error("Password and hashed password are required");
    }
    return await compare(plainPassword, hashedPassword);
}