import * as bcrypt from "bcrypt";

export const Hash = (
  plainText: string,
  saltRounds: number = parseInt(process.env.SALT_ROUNDS as string),
): string => {
  const hash = bcrypt.hashSync(plainText, saltRounds);
  return hash;
};

export const CompareHashed = (
  plainText: string,
  hashedPassword: string,
): boolean => {
  return bcrypt.compareSync(plainText, hashedPassword);
};

export const ChangedPassword = (
  passwordChangedAt: Date | null,
  JWTTimestamp: number,
) => {
  if (passwordChangedAt) {
    const changedTimestamp = Math.floor(passwordChangedAt.getTime() / 1000);

    return JWTTimestamp < changedTimestamp;
  }
  return false;
};
