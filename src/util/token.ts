import jwt = require('jsonwebtoken');
import { Db } from 'mongodb';

export const refreshTokenAlreadyUsed = async (
  refreshToken: string,
  db: Db
): Promise<Boolean> => {
  const used = await db.collection('refreshTokens').findOne({ refreshToken });
  return !!used;
};

export const verifyRefreshToken = async (refreshToken: string, db: Db) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

    if (!decoded || (await refreshTokenAlreadyUsed(refreshToken, db)))
      return false;

    return decoded;
  } catch (e) {
    console.error(e);
  }
};

export const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (e) {
    if (e.name === 'TokenExpiredError') throw new Error(e.name);
    return false;
  }
};

export const buildToken = (userId: string, refreshToken = false): string => {
  return jwt.sign(
    {
      userId,
    },
    refreshToken ? process.env.REFRESH_SECRET : process.env.JWT_SECRET,
    { expiresIn: refreshToken ? '7d' : 45 }
  );
};

export const insertRefreshTokenInDb = async (
  refreshToken: string,
  userId: string,
  db: Db
) => {
  try {
    const inserted = await db
      .collection('refreshTokens')
      .insertOne({ refreshToken, userId });
  } catch (e) {
    console.error(e);
  }
};
