import bcrypt from "bcrypt";

/**
 * Function to salt and hash a password
 * @param password - The password to be hashed
 * @returns A promise that resolves to the salted and hashed password
 */
export const saltAndHashPassword = async (
  password: string
): Promise<string> => {
  if (!password) {
    throw new Error("Password is required");
  }

  const saltRounds = 10; // Number of hashing rounds
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

/**
 * Function to compare a password with a hashed password
 * @param password - The password to be compared
 * @param hashedPassword - The hashed password to be compared
 * @returns A promise that resolves to a boolean indicating if the passwords match
 */

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};
