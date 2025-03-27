import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { db } from '../index.js'; 
import 'dotenv/config';

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
  return { accessToken, refreshToken };
};



const registerUser = async (req, res) => {
  const { name, phone_number, whatsapp_number, email, password } = req.body;

  try {
      // Check if email already exists
      const [existingUser] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
      if (existingUser.length > 0) return res.status(400).json({ message: "Email already exists" });

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user into DB
      await db.execute(
          "INSERT INTO users (name, phone_number, whatsapp_number, email, password) VALUES (?, ?, ?, ?, ?)",
          [name, phone_number, whatsapp_number, email, hashedPassword]
      );

      res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};



const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
      // Check if user exists
      const [users] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
      if (users.length === 0) return res.status(400).json({ message: "User not found" });

      const user = users[0];

      // Validate password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user.id);

      // Store refresh token in DB
      await db.execute("UPDATE users SET refresh_token = ? WHERE id = ?", [refreshToken, user.id]);

      res.status(200).json({ accessToken, refreshToken });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};

const refresh= async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: "No refresh token provided" });

  try {
      // Check if refresh token exists in DB
      const [users] = await db.execute("SELECT * FROM users WHERE refresh_token = ?", [refreshToken]);
      if (users.length === 0) return res.status(403).json({ message: "Invalid refresh token" });

      const user = users[0];

      // Verify refresh token
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
          if (err) return res.status(403).json({ message: "Invalid or expired refresh token" });

          // Generate new tokens
          const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id);

          // Update refresh token in DB
          await db.execute("UPDATE users SET refresh_token = ? WHERE id = ?", [newRefreshToken, user.id]);

          res.status(200).json({ accessToken, refreshToken: newRefreshToken });
      });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
}

const logoutUser=async (req, res) => {

  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: "No refresh token provided" });

  try {
      // Remove refresh token from DB
      await db.execute("UPDATE users SET refresh_token = NULL WHERE refresh_token = ?", [refreshToken]);
      res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
}

const getProfile = async (req, res) => {
  try {

    const [users] = await db.execute("SELECT name, email, phone_number FROM users WHERE id = ?", [req.userId]);
    if (users.length === 0) return res.status(404).json({ message: "User not found" });

    res.status(200).json(users[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



 export {
    registerUser,
    loginUser,
    refresh,
    logoutUser,
    getProfile

 }