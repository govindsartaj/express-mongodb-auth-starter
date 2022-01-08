import { compare, genSalt, hash } from 'bcrypt';

export const hashPassword = async (raw: string): Promise<string> => {
  try {
    const salt = await genSalt(10);
    return await hash(raw, salt);
  } catch (e) {
    console.error(e);
  }
};

export const verifyPassword = async (
  inputPassword: string,
  userPasswordHash: string
) => {
  return await compare(inputPassword, userPasswordHash);
};
