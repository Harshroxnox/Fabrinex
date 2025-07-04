import jwt from "jsonwebtoken"

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