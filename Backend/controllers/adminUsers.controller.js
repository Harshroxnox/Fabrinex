import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { db } from '../index.js'; 
import { generateTokens } from "../utils/jwt.utils.js";
import { constants } from "../config/constants.js";
import { validEmail, validID, validPassword } from "../utils/validators.utils.js";
import { error } from "console";
import AppError from "../errors/appError.js";
import logger from "../utils/logger.js";


export const registerAdmin = async (req, res,next) => {
  // const { email, password, roles } = req.body;
  const email= validEmail(req.body.email);
  const password=validPassword(req.body.password);
  const roles=req.body.roles;
  try {
    //validate email
    if(email===null){
      throw new AppError(422,"Invalid Email Provided");
    }
  
    //password validation
    if(password===null){
      throw new AppError(422,'Invalid Password. Password must contain atleast 1 capital letter,1 special Character, 1 numeric digit');
    }

    // Here roles is an array like: roles = ['admin', 'web-editor']
    // Roles validation
    const invalidRoles = !Array.isArray(roles) || roles.length === 0 || roles.some(role => !constants.ADMIN_ROLES.includes(role));
    if (invalidRoles) {
      throw new AppError(400,'Invalid roles provided. Allowed roles are: '+ constants.ADMIN_ROLES.join(', '));
    }

    const [existingUser] = await db.execute("SELECT * FROM AdminUsers WHERE email = ?", [email]);
    if (existingUser.length > 0) throw new AppError(400,"Email already exists");

    const hashedPassword = await bcrypt.hash(password, 10);

    // Inserting Admin User
    const [result] = await db.execute(
      "INSERT INTO AdminUsers (email, password) VALUES (?, ?)",
      [ email, hashedPassword ]
    );
    
    const adminID = result.insertId;

    // Inserting Roles for that User
    for (const role of roles) {
      await db.execute(
        "INSERT INTO AdminRoles (adminID, role_name) VALUES (?, ?)",
        [ adminID, role ]
      );
    }

    res.status(201).json({ 
      message: "AdminUser registered successfully",
      adminID
    });

  } catch (error) {
    logger.error("Error registering adminUser:", error);
    next(error);
  }
};


export const loginAdmin = async (req, res,next) => {
  
  const email=validEmail(req.body.email);
  const password=validPassword(req.body.password);
  try {

    //validate email
    if(email===null){
      throw new AppError(422,'Invalid Email Provided');
    } //invalidating here so that we dnt need to search in the database for wrong email 
    
    // Check if user exists
    const [admins] = await db.execute("SELECT * FROM AdminUsers WHERE email = ?", [email]);
    if (admins.length === 0) throw new AppError(400,"User not found");

    const admin = admins[0];

    // Validate password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) throw new AppError(400,"Invalid credentials");

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
    logger.error("Error logging adminUser:", error);
    next(error);
  }
};


export const refreshAdmin = async (req, res,next) => {
  const refreshToken = req.cookies.refreshToken;
  try {
  
    if (!refreshToken) throw new AppError(401,"NO refresh token provided");

    // Check if refresh token exists in DB
    const [admins] = await db.execute("SELECT * FROM AdminUsers WHERE refresh_token = ?", [refreshToken]);
    if (admins.length === 0) throw new AppError(403,"Invalid refresh token");

    const admin = admins[0];

    // Verify refresh token
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (err) throw new AppError(403,"Invalid or expired refresh token");

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
    logger.error("Error refresh adminUser:", error);
    next(error);
  }
};


export const logoutAdmin= async (req, res,next) => {
  const adminID = req.adminID; // from auth middleware

  try {
      // Remove refresh token from DB
      await db.execute("UPDATE AdminUsers SET refresh_token = NULL WHERE adminID = ?", [adminID]);

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
    logger.error("Error logout adminUser:", error);
    next(error);
  }
};


export const getAllAdmins = async (req, res,next) => {
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
    res.status(200).json({
      message: "Fetched all admins successfully", 
      admins 
    });
  } catch (error) {
    logger.error("Error fetching all admins:", error);
    next(error);
  }
};


export const getRoleAdmin = async (req, res,next) => {
  const adminID = req.adminID;

  try{
    const [roles] = await db.execute(
      'SELECT role_name FROM AdminRoles WHERE adminID = ?',
      [adminID]  
    );
    const roleNames = roles.map(r => r.role_name);
    res.status(200).json({ 
      message: "Fetched the roles of admin successfully",
      roleNames 
    });
    
  } catch (error) {
    logger.error("Error fetching roles of admin:", error);
    next(error);
  }
};


export const updateAdmin = async (req, res) => {
 
  const adminID=validID(req.params.adminID);
  const password=validPassword(req.body.password);
  const roles=req.body.roles;
  try {

    //admin id validation
    if(adminID===null){
      throw new AppError(422,"Invalid admin id");
    }
    //password validation
    if(password===null){
      throw new AppError(422,"Invalid Password. Password must contain atleast 1 capital letter,1 special Character, 1 numeric digit");
    }
    // Roles validation
    const invalidRoles = !Array.isArray(roles) || roles.length === 0 || roles.some(role => !constants.ADMIN_ROLES.includes(role));
    if (invalidRoles) {
      throw new AppError(400,'Invalid roles provided. Allowed roles are: ' + constants.ADMIN_ROLES.join(', '));
    }

    // 1. Check if admin exists
    const [adminRows] = await db.execute(
      `SELECT adminID FROM AdminUsers WHERE adminID = ?`,
      [adminID]
    );
    if (adminRows.length === 0) {
      throw new AppError(404,"Admin not found");
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

    res.status(200).json({ message: 'Admin updated successfully.' });
  } catch (error) {
    logger.error("Error updating admin:", error);
    next(error);
  }
};


export const deleteAdmin = async (req, res,next) => {
  const adminID  = validID(req.params.adminID);
  //admin id validation
  try {
  
    if(adminID===null){
      throw new AppError(422,'Invalid admin id');
    }
    // 1. Check if the admin exists
    const [adminRows] = await db.execute(
      `SELECT adminID FROM AdminUsers WHERE adminID = ?`,
      [adminID]
    );
    if (adminRows.length === 0) {
      throw new AppError(404,"Admin not found");
    }

    // 2. Delete the admin
    await db.execute(
      `DELETE FROM AdminUsers WHERE adminID = ?`,
      [adminID]
    );
    res.status(200).json({ message: 'Admin deleted successfully.' });
  } catch (error) {
    logger.error("Error deleting admin:", error);
    next(error);
  }
};
