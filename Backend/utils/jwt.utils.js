import jwt from "jsonwebtoken"
import { redis } from '../index.js';
import logger from './logger.js';

export const generateTokens = (id, userType) => {
  const accessToken = jwt.sign(
    {
      id: id,
      userType: userType
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
  const refreshToken = jwt.sign(
    {
      id: id,
      userType: userType
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
  return { accessToken, refreshToken };
};


export const blacklistToken = async (token) => {
  if (!token) throw new Error("Token missing");

  const decoded = jwt.decode(token);
  if (!decoded?.exp) throw new Error("Invalid token: no expiration");

  const ttl = decoded.exp - Math.floor(Date.now() / 1000);

  if (ttl <= 0) {
    logger.info("Token already expired, no need to blacklist.");
    return null; 
  }

  await redis.set(`bl_${token}`, '1', 'EX', ttl);
};
