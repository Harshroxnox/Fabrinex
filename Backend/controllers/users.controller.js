import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import crypto from 'crypto';
import { db } from '../index.js';
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { isOTPVerified } from "../utils/otp.helper.js";
import { deleteTempImg } from "../utils/deleteTempImg.js";
import { razorpay } from "../utils/razorpay.utils.js";
import { generateTokens, blacklistToken } from "../utils/jwt.utils.js";
import { constants } from '../config/constants.js';
import { validEmail, validID, validPassword, validPhoneNumber, validString, validStringChar, validStringNum, validWholeNo } from "../utils/validators.utils.js";
import logger from "../utils/logger.js";
import AppError from "../errors/appError.js";

// User Routes ------------------------------------------------------------------------------------

export const registerUser = async (req, res, next) => {
  const name = validStringChar(req.body.name,2,100);
  const email = validEmail(req.body.email);
  const password = validPassword(req.body.password);
  const profilePicPath  = req.file ? req.file.path : null;
  const validatedPhoneNumber = validPhoneNumber(req.body.phone_number);
  const validatedWhatsappNumber = validPhoneNumber(req.body.whatsapp_number);
  let cloudinaryID;

  try {
    //name validation
    if (name === null) {
      throw new AppError(422 , "Invalid User name");
    }
  
    //email validation
    if (email === null) {
      throw new AppError(422 , "Invalid Email provided");
    }

    //password validation
    if (password === null) {
      throw new AppError(422 , "Invalid Password. Password must contain atleast 1 capital letter,1 special Character, 1 numeric digit and should be between 9 to 255 characters");
    }

    //phone number validation
    if (validatedPhoneNumber === null) {
      throw new AppError(422 , "Invalid phone number");
    }

    //whatsapp number validation
    if (validatedWhatsappNumber === null) {
      throw new AppError(422 , "Invalid whatsapp number");
    }


    const verified = await isOTPVerified(email,validatedPhoneNumber);
    //if (!verified) throw new AppError(403, "Please verify OTP before registering");

    const [existingUser] = await db.execute("SELECT * FROM Users WHERE email = ?", [email]);
    if (existingUser.length > 0) throw new AppError(400, "Email already exists");

    const hashedPassword = await bcrypt.hash(password, 10);
    let profileImgUrl = null;

    if (profilePicPath) {
      const uploadedImage = await uploadOnCloudinary(profilePicPath);
      profileImgUrl = uploadedImage?.url || null;
      cloudinaryID=uploadedImage.public_id;
    }

    let razorpay_customer_id = crypto.randomBytes(6).toString('hex');
    if (process.env.NODE_ENV === 'production') {
      const customer = await razorpay.customers.create({ name, email, contact: validatedPhoneNumber });
      razorpay_customer_id = customer.id;
    }

    await db.execute(
      "INSERT INTO Users (name, phone_number, whatsapp_number, email, password, profile_img, razorpay_customer_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [name, validatedPhoneNumber, validatedWhatsappNumber, email, hashedPassword, profileImgUrl, razorpay_customer_id]
    );

    res.status(201).json({ message: "User registered successfully", profileImg: profileImgUrl });
  } catch (error) {
    if (cloudinaryID) {
      deleteFromCloudinary(cloudinaryID).catch((error) => {
        logger.warn(`Cloudinary deletion failed. CloudinaryID:${cloudinaryID} ${error.message}`);
      });
    }
    next(error);
  }finally {
    //Deleting temp image if needed
    if (profilePicPath) {
      deleteTempImg(profilePicPath).catch((error) => {
        logger.warn(`Failed to delete file ${profilePicPath}: ${error.message}`);
      });
    }
  }
};


export const loginUser = async (req, res, next) => {
  const email = validEmail(req.body.email);
  const password = validPassword(req.body.password);

  try {
    if (email === null) {
      throw new AppError(422 , "Invalid Email Provided");
    }
    if (password === null) {
      throw new AppError(
        422 , 
        'Invalid Password. Password must contain atleast 1 capital letter, 1 lowercase, 1 special Character , 1 numeric Digit'
      );
    }
    // Check if user exists
    const [users] = await db.execute("SELECT * FROM Users WHERE email = ?", [email]);
    if (users.length === 0) {
      throw new AppError(400, "User not found");
    }

    const user = users[0];

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new AppError(400, "Invalid credentials");

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.userID, 'user');

    // Store refresh token in DB
    await db.execute("UPDATE Users SET refresh_token = ? WHERE userID = ?", [refreshToken, user.userID]);


    res.cookie('accessToken', accessToken, {
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
    next(error);
  }
};


export const refreshUser = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
 
  try {
    if (!refreshToken) throw new AppError(401, "No refresh token provided");
    
    // Check if refresh token exists in DB
    const [users] = await db.execute("SELECT * FROM Users WHERE refresh_token = ?", [refreshToken]);
    if (users.length === 0) throw new AppError(403, "Invalid refresh token");

    const user = users[0];

    // Verify refresh token 
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (err) throw new AppError(403, "Invalid or expired refresh token");

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.userID, 'user');

      // Update refresh token in DB
      await db.execute("UPDATE Users SET refresh_token = ? WHERE userID = ?", [newRefreshToken, user.userID]);

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
      next(error);
  }
};


export const logoutUser = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const authHeader = req.header("Authorization");
    const accessToken = authHeader.split(' ')[1];
    if (!refreshToken || !authHeader) {
      throw new AppError(401, "Tokens missing");
    }

    await blacklistToken(accessToken); 
    await db.execute("UPDATE Users SET refresh_token = NULL WHERE refresh_token = ?", [refreshToken]);

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
    next(error);
  }
};


export const getAllUsers = async (req, res, next) => {
  try {
    const limit = validID(req.query.limit);
    const page = validID(req.query.page);

    if (limit === null || limit > constants.MAX_LIMIT){
      throw new AppError(400, `Limit must be a valid number below ${constants.MAX_LIMIT}`);
    }

    if(page === null){
      throw new AppError(400, "Page must be a valid number");
    }

    const offset = (page - 1) * limit;
    const [users] = await db.execute(`
      SELECT 
        u.userID,
        u.name,
        u.email,
        u.phone_number,
        u.whatsapp_number,
        u.created_at,
        COUNT(o.orderID) AS order_count
      FROM Users u
      LEFT JOIN Orders o ON u.userID = o.userID
      GROUP BY u.userID, u.name, u.email, u.phone_number, u.whatsapp_number, u.created_at
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `, [`${limit}`, `${offset}`]);

    const [count] = await db.execute(`SELECT COUNT(*) AS count FROM Users`);

    res.status(200).json({
      message: "All users fetched successfully",
      total: count[0].count,
      users: users 
    });
  } catch (error) {
    next(error);
  }
};

export const getUserByName = async (req, res, next) => {
  const name = validStringChar(req.query.name);

  try {
    if(name === null){
      throw new AppError(400, "Given search term(name) must be valid");
    }

    const [users] = await db.execute(`
      SELECT 
        u.userID,
        u.name,
        u.email,
        u.phone_number,
        u.whatsapp_number,
        u.created_at,
        COUNT(o.orderID) AS order_count
      FROM Users u
      LEFT JOIN Orders o ON u.userID = o.userID
      WHERE u.name LIKE ?
      GROUP BY u.userID
      ORDER BY u.created_at DESC
    `, [`%${name}%`]);

    res.status(200).json({
      message: "User search successfull",
      users: users 
    });

  } catch (error){
    next(error);
  }
}


export const getProfile = async (req, res, next) => {
  const userID = req.userID;

  try {
    const [users] = await db.execute("SELECT name, email, phone_number FROM Users WHERE userID = ?", [userID]);
    if (users.length === 0) throw new AppError(404, "User not found");

    res.status(200).json({
      message: "Fetched user profile successfully", 
      user: users[0] 
    });
  } catch (error) {
    next(error);
  }
};

// User Address Routes ----------------------------------------------------------------------------

export const addAddress = async (req, res, next) => {
  try {
    const userID = req.userID;
    const pincode = validStringNum(req.body.pincode, 6, 6);
    const { city, state, address_line } = req.body;

    if(pincode === null){
      throw new AppError(422 , "Invalid pincode must be of 6 digits");
    }

    await db.execute(
      "INSERT INTO Addresses (userID, city, pincode, state, address_line) VALUES (?, ?, ?, ?, ?)",
      [userID, city, pincode, state, address_line]
    );
    res.status(201).json({ message: "Address added successfully" });
  } catch (error) {
    next(error);
  }
};


export const getAddress = async (req, res, next) => {
  try {
    const userID = req.userID;
    const [addresses] = await db.execute(
      "SELECT * FROM Addresses WHERE userID = ?",
      [userID]
    );

    res.status(200).json({
      message: "Fetched users address successfully", 
      addresses 
    });
  } catch (error) {
    next(error);
  }
};


export const updateAddress = async (req, res, next) => {
  const userID = req.userID;
  const pincode = validStringNum(req.body.pincode, 6, 6);
  const addressID = validID(req.params.addressID);
  const { city, state, address_line } = req.body;

  try {
    if(pincode === null){
      throw new AppError(422 , "Invalid pincode must be of 6 digits");
    }
    //validate address id
    if (addressID === null) {
      throw new AppError(422 , "Invalid address id");
    }
    await db.execute(
      `UPDATE Addresses 
       SET city = ?, pincode = ?, state = ?, address_line = ?
       WHERE addressID = ? AND userID = ?`,
      [city, pincode, state, address_line, addressID, userID]
    );

    res.status(200).json({ message: "Address updated successfully" });
  } catch (error) {
    next(error);
  }
};


export const deleteAddress = async (req, res, next) => {
  const userID = req.userID;
  const addressID = validID(req.params.addressID);

  try {
    if (addressID === null) {
      throw new AppError(422 , "Invalid address id");
    }
    await db.execute(
      "DELETE FROM Addresses WHERE addressID = ? AND userID = ?",
      [addressID, userID]
    );

    res.status(200).json({ message: "Address deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// User Cart Routes -------------------------------------------------------------------------------

export const addItem = async (req, res, next) => {
  const variantID = validID(req.params.variantID);
  const quantity = validID(req.body.quantity);
  const userID = req.userID;

  try {
    if (variantID === null) {
      throw new AppError(422 , 'Invalid variant id');
    }
    if (quantity === null) {
      throw new AppError(400, "Invalid quantity must be 1 or greater");
    }

    const [items] = await db.execute("SELECT * FROM CartItems WHERE userID = ? AND variantID = ?",
      [userID, variantID]
    )

    // If item is already added to card, increase quantity
    if (items.length !== 0) {
      await db.execute("UPDATE CartItems SET quantity = quantity + ? WHERE userID = ? AND variantID = ?",
        [quantity, userID, variantID]
      )
      return res.status(200).json({ message: "Items added to cart" });
    }

    // Else add item in DB
    await db.execute("INSERT INTO CartItems (userID, variantID, quantity) VALUES (?, ?, ?)",
      [userID, variantID, quantity]
    )
    return res.status(200).json({ message: "Items added to cart" });

  } catch (error) {
    next(error);
  }
};


export const deleteItem = async (req, res, next) => {
  const variantID = validID(req.params.variantID);
  const userID = req.userID;

  try {
    if (variantID === null) {
      throw new AppError(422 , 'Invalid variant id');
    }
    await db.execute("DELETE FROM CartItems WHERE userID = ? AND variantID = ?",
      [userID, variantID]
    )

    return res.status(200).json({ message: "Items deleted from cart" });

  } catch (error) {
    next(error);
  }
};


export const updateQuantity = async (req, res, next) => {
  const variantID = validID(req.params.variantID);
  const quantity = validID(req.body.quantity);

  try {
    // validate variant ID
    if (variantID === null) {
      throw new AppError(422 , "Invalid variant ID type");
    }
    // validate quantity
    if (quantity === null) {
      throw new AppError(422 , "Invalid variant quantity provided")
    }
    const userID = req.userID;

    if (!variantID || quantity <= 0) {
      throw new AppError(400, "Invalid variantID or quantity");
    }

    const [results] = await db.execute("UPDATE CartItems SET quantity = ? WHERE userID = ? AND variantID = ?",
      [quantity, userID, variantID]
    );

    if (results.affectedRows === 0) {
      throw new AppError(400, "Cart Item not found");
    }

    return res.status(200).json({ message: "Item quantity updated" });

  } catch (error) {
    next(error);
  }
};


export const getCart = async (req, res, next) => {
  const userID = req.userID;

  try {
    const [cartItems] = await db.execute(`
      SELECT 
        p.name,
        p.category,
        pv.size,
        pv.color,
        pv.price,
        pv.discount,
        pv.main_image,
        ci.quantity
      FROM 
        CartItems ci
      JOIN 
        ProductVariants pv ON ci.variantID = pv.variantID
      JOIN 
        Products p ON pv.productID = p.productID
      WHERE 
        ci.userID = ?
    `, [userID]);

    res.status(200).json({
      message: "Fetched user cart successfully", 
      cartItems 
    });
  } catch (error) {
    next(error);
  }
};
