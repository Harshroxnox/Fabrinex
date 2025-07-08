import jwt from 'jsonwebtoken';
import { db } from '../index.js'; 
import logger from '../utils/logger.js';

export const authMiddleware = (allowedUser) => (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header missing" });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: "Authorization header format is 'Bearer <token>'" });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const { id, userType } = decoded;

    // Validate userType is allowed 
    if (userType !== allowedUser) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Validate that id is a positive integer
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if(userType === 'user'){
      req.userID = id; // Attach user ID to request object
      req.userType = userType;
    }else if(userType === 'admin'){
      req.adminID = id; // Attach admin ID to request object
      req.userType = userType;
    }
    
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};


export const authUserAdmin = (allowedRoles = []) =>async (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header missing" });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: "Authorization header format is 'Bearer <token>'" });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const { id, userType } = decoded;

    // If user 
    if (userType === 'user') {
      req.userID = id; // Attach user ID to request object
      req.userType = userType;
      return next();
    }

    // If admin
    if (userType === 'admin') {
      // if no roles required allow any admin
      if(allowedRoles.length === 0){
        req.adminID = id; // Attach admin ID to request object
        req.userType = userType;
        return next();
      }

      // check if admin has any of the roles mentioned in allowedRoles
      let roles;
      try {
        [roles] = await db.execute(
          'SELECT role_name FROM AdminRoles WHERE adminID = ?',
          [id]  
        );
      } catch (error){
        logger.error(`Error checking roles adminID:${id}`, error);
        return res.status(500).json({ error: "Internal server error" });
      }
      const roleNames = roles.map(r => r.role_name);
  
      const hasAccess = roleNames.some(role => allowedRoles.includes(role));
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }

      req.adminID = id; // Attach admin ID to request object
      req.userType = userType;
      return next();
    }

    return res.status(403).json({ error: 'Access denied' });
    
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};


export const checkAdminRoles = (allowedRoles=[]) => async (req, res, next) => {
  // check if admin from userType
  if (req.userType !== 'admin'){
    return res.status(403).json({ error: 'Access denied' });
  }

  // Nothing to check
  if(allowedRoles.length === 0){
    return next();
  }

  const adminID = req.adminID;

  try {
    const [roles] = await db.execute(
      'SELECT role_name FROM AdminRoles WHERE adminID = ?',
      [adminID]  
    );
    const roleNames = roles.map(r => r.role_name);

    const hasAccess = roleNames.some(role => allowedRoles.includes(role));
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    next();
    
  } catch (error) {
    logger.error(`Error checking roles adminID:${adminID}`, error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
