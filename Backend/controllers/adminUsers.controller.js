import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { db } from '../index.js'; 
import { generateTokens } from "./users.controller.js";
import { constants } from "../config/constants.js";

const registerAdmin = async (req, res) => {
    const { email, password, roles } = req.body;

    // Here roles is an array like: roles = ['admin', 'web-editor']
    // Roles validation
    const invalidRoles = !Array.isArray(roles) || roles.length === 0 || roles.some(role => !constants.ADMIN_ROLES.includes(role));
    if (invalidRoles) {
        return res.status(400).json({
            message: 'Invalid roles provided. Allowed roles are: ' + constants.ADMIN_ROLES.join(', ')
        });
    }

    try {
      const [existingUser] = await db.execute("SELECT * FROM AdminUsers WHERE email = ?", [email]);
      if (existingUser.length > 0) return res.status(400).json({ message: "Email already exists" });
  
      const hashedPassword = await bcrypt.hash(password, 10);

      // Inserting Admin User
      const [result] = await db.execute(
        "INSERT INTO AdminUsers (email, password) VALUES (?, ?)",
        [ email, hashedPassword ]
      );
      
      const adminID = result.insertId;

      // Inserting Roles for that User
      roles.forEach(async (role) => {
        await db.execute(
            "INSERT INTO AdminRoles (adminID, role_name) VALUES (?, ?)",
            [ adminID, role ]
        );
      })

      res.status(201).json({ message: "AdminUser registered successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};

const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const [admins] = await db.execute("SELECT * FROM AdminUsers WHERE email = ?", [email]);
    if (admins.length === 0) return res.status(400).json({ message: "User not found" });

    const admin = admins[0];

    // Validate password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(admin.adminID, 'admin');
    
    // Store refresh token in DB
    await db.execute("UPDATE AdminUsers SET refresh_token = ? WHERE adminID = ?", [refreshToken, admin.adminID]);
    
    res.cookie('accessToken', accessToken, {
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'Strict', 
      maxAge: 60 * 60 * 1000, // Cookie expires in 60 minutes
    });

    // Set the refresh token as an HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // Cookie is not accessible via JavaScript
      secure: process.env.NODE_ENV === 'production', // Cookie is sent only over HTTPS in production
      sameSite: 'Strict', // Adjust based on your requirements
      maxAge: 10 * 24 * 60 * 60 * 1000, // Cookie expires in 10 days
    });

    res.status(200).json({ message: 'Login successful' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const refreshAdmin = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: "No refresh token provided" });

  try {
    // Check if refresh token exists in DB
    const [admins] = await db.execute("SELECT * FROM AdminUsers WHERE refresh_token = ?", [refreshToken]);
    if (admins.length === 0) return res.status(403).json({ message: "Invalid refresh token" });

    const admin = admins[0];

    // Verify refresh token
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Invalid or expired refresh token" });

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = generateTokens(admin.adminID, 'admin');

      // Update refresh token in DB
      await db.execute("UPDATE AdminUsers SET refresh_token = ? WHERE adminID = ?", [newRefreshToken, admin.adminID]);

      // Set HTTP-only cookies for both tokens
      const isProduction = process.env.NODE_ENV === 'production';
      res.cookie('accessToken', accessToken, {
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

const logoutAdmin= async (req, res) => {
  const refreshToken  = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: "No refresh token provided" });

  try {
      // Remove refresh token from DB
      await db.execute("UPDATE AdminUsers SET refresh_token = NULL WHERE refresh_token = ?", [refreshToken]);

      res.clearCookie('accessToken', {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
      });
    
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
      });
    
      res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};

const getAllAdmins = async (req, res) => {
  try {
      const [admins] = await db.execute(`
        SELECT 
          u.adminID,
          u.email,
          JSON_ARRAYAGG(r.role_name) AS roles
        FROM AdminUsers u
        LEFT JOIN AdminRoles r ON u.adminID = r.adminID
        GROUP BY u.adminID, u.email
      `);
      res.json(admins);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
};

const getRoleAdmin = async (req, res) => {
  const adminID = req.adminID;

  try{
    const [roles] = await db.execute(
      'SELECT role_name FROM AdminRoles WHERE adminID = ?',
      [adminID]  
    );
    const roleNames = roles.map(r => r.role_name);
    res.json(roleNames);
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateAdmin = async (req, res) => {
  const { adminID } = req.params;
  const { password, roles } = req.body; // `roles` is expected to be an array of strings

  // Roles validation
  const invalidRoles = !Array.isArray(roles) || roles.length === 0 || roles.some(role => !constants.ADMIN_ROLES.includes(role));
  if (invalidRoles) {
      return res.status(400).json({
          message: 'Invalid roles provided. Allowed roles are: ' + constants.ADMIN_ROLES.join(', ')
      });
  }

  try {
    // 1. Check if admin exists
    const [adminRows] = await db.execute(
      `SELECT adminID FROM AdminUsers WHERE adminID = ?`,
      [adminID]
    );
    if (adminRows.length === 0) {
      return res.status(404).json({ error: 'Admin not found.' });
    }

    // 2. Update password
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.execute(
      `UPDATE AdminUsers SET password = ? WHERE adminID = ?`,
      [hashedPassword, adminID]
    );

    // 3. Delete old roles
    await db.execute(
      `DELETE FROM AdminRoles WHERE adminID = ?`,
      [adminID]
    );

    // 4. Insert new roles
    const values = roles.map(role => [adminID, role]);
    await db.query(
      `INSERT INTO AdminRoles (adminID, role_name) VALUES ?`,
      [values]
    );

    res.json({ message: 'Admin updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteAdmin = async (req, res) => {
  const { adminID } = req.params;

  try {
    // 1. Check if the admin exists
    const [adminRows] = await db.execute(
      `SELECT adminID FROM AdminUsers WHERE adminID = ?`,
      [adminID]
    );
    if (adminRows.length === 0) {
      return res.status(404).json({ error: 'Admin not found.' });
    }

    // 2. Delete the admin
    await db.execute(
      `DELETE FROM AdminUsers WHERE adminID = ?`,
      [adminID]
    );
    res.json({ message: 'Admin deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export { 
    registerAdmin,
    loginAdmin,
    refreshAdmin,
    logoutAdmin, 
    getAllAdmins,
    getRoleAdmin,
    updateAdmin,
    deleteAdmin
};