import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { db } from '../index.js'; 
import 'dotenv/config';
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { isOTPVerified } from "../utils/otp.helper.js";

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
  const profilePicPath = req.file ? req.file.path : null;

  try {
    const verified = await isOTPVerified({ email, phone_number });
    if (!verified) return res.status(403).json({ message: "Please verify OTP before registering" });

    const [existingUser] = await db.execute("SELECT * FROM Users WHERE email = ?", [email]);
    if (existingUser.length > 0) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    let profileImgUrl = null;
    if (profilePicPath) {
      const uploadedImage = await uploadOnCloudinary(profilePicPath);
      profileImgUrl = uploadedImage?.url || null;
    }

    await db.execute(
      "INSERT INTO Users (name, phone_number, whatsapp_number, email, password, profile_img) VALUES (?, ?, ?, ?, ?, ?)",
      [name, phone_number, whatsapp_number, email, hashedPassword, profileImgUrl]
    );

    res.status(201).json({ message: "User registered successfully", profileImg: profileImgUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
      // Check if user exists
      const [users] = await db.execute("SELECT * FROM Users WHERE email = ?", [email]);
      if (users.length === 0) return res.status(400).json({ message: "User not found" });

      const user = users[0];

      // Validate password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user.id);

      // Store refresh token in DB
      await db.execute("UPDATE Users SET refresh_token = ? WHERE id = ?", [refreshToken, user.id]);

      res.cookie('accessToken', accessToken, {
        httpOnly: true, // Cookie is not accessible via JavaScript
        secure: process.env.NODE_ENV === 'production', // Cookie is sent only over HTTPS in production
        sameSite: 'Strict', // Adjust based on your requirements
        maxAge: 60 * 60 * 1000, // Cookie expires in 60 minutes
      });
  
      // Set the refresh token as an HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 10 * 24 * 60 * 60 * 1000, // Cookie expires in 10 days
      });
  
      res.status(200).json({ message: 'Login successful' });

  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};

const refresh = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: "No refresh token provided" });

  try {
    // Check if refresh token exists in DB
    const [users] = await db.execute("SELECT * FROM Users WHERE refresh_token = ?", [refreshToken]);
    if (users.length === 0) return res.status(403).json({ message: "Invalid refresh token" });

    const user = users[0];

    // Verify refresh token
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Invalid or expired refresh token" });

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id);

      // Update refresh token in DB
      await db.execute("UPDATE Users SET refresh_token = ? WHERE id = ?", [newRefreshToken, user.id]);

      // Set HTTP-only cookies for both tokens
      const isProduction = process.env.NODE_ENV === 'production';
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'Strict',
        maxAge: 60 * 60 * 1000, // 1 hour
      });
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({ message: "Tokens refreshed successfully" });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const logoutUser=async (req, res) => {

  const  refreshToken  = req.cookies.refreshToken;
 
  if (!refreshToken) return res.status(401).json({ message: "No refresh token provided" });

  try {
      // Remove refresh token from DB
      await db.execute("UPDATE Users SET refresh_token = NULL WHERE refresh_token = ?", [refreshToken]);


      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
      });
    
      res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
}

const getProfile = async (req, res) => {
  try {

    const [users] = await db.execute("SELECT name, email, phone_number FROM Users WHERE id = ?", [req.userId]);
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