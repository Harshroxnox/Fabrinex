import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import crypto from 'crypto';
import { db } from '../index.js'; 
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { isOTPVerified } from "../utils/otp.helper.js";
import { razorpay } from "../utils/razorpay.utils.js";

const generateTokens = (id, userType) => {
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

// User Routes ------------------------------------------------------------------------------------

const registerUser = async (req, res) => {
  const { name, phone_number, whatsapp_number, email, password } = req.body;
  const profilePicPath = req.file ? req.file.path : null;

  try {
    const verified = await isOTPVerified(email, phone_number);
    if (!verified) return res.status(403).json({ message: "Please verify OTP before registering" });

    const [existingUser] = await db.execute("SELECT * FROM Users WHERE email = ?", [email]);
    if (existingUser.length > 0) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    let profileImgUrl = null;
    if (profilePicPath) {
      const uploadedImage = await uploadOnCloudinary(profilePicPath);
      profileImgUrl = uploadedImage?.url || null;
    }

    let razorpay_customer_id = crypto.randomBytes(6).toString('hex');
    if (process.env.NODE_ENV === 'production'){
      const customer = await razorpay.customers.create({ name, email, contact: phone_number });
      razorpay_customer_id = customer.id;
    }
    
    await db.execute(
      "INSERT INTO Users (name, phone_number, whatsapp_number, email, password, profile_img, razorpay_customer_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [name, phone_number, whatsapp_number, email, hashedPassword, profileImgUrl, razorpay_customer_id]
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
    res.status(500).json({ error: error.message });
  }
};

const refreshUser = async (req, res) => {
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
    res.status(500).json({ error: error.message });
  }
};

const logoutUser=async (req, res) => {
  const refreshToken  = req.cookies.refreshToken;
 
  if (!refreshToken) return res.status(401).json({ message: "No refresh token provided" });

  try {
      // Remove refresh token from DB
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
      res.status(500).json({ error: error.message });
  }
}

const getAllUsers = async (req, res) => {
  try {
      const [users] = await db.execute("SELECT name, email, phone_number FROM Users");
      res.json(users);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const [users] = await db.execute("SELECT name, email, phone_number FROM Users WHERE userID = ?", [req.userID]);
    if (users.length === 0) return res.status(404).json({ message: "User not found" });

    res.status(200).json(users[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// User Address Routes ----------------------------------------------------------------------------

const addAddress = async (req, res) => {
  const userID = req.userID;
  const { city, pincode, state, address_line } = req.body;

  try {
    await db.execute(
      "INSERT INTO Addresses (userID, city, pincode, state, address_line) VALUES (?, ?, ?, ?, ?)", 
      [userID, city, pincode, state, address_line]
    );
    res.status(201).json({ message: "Address added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAddress = async (req, res) => {
  const userID = req.userID;

  try {
    const [addresses] = await db.execute(
      "SELECT * FROM Addresses WHERE userID = ?",
      [userID]
    );

    res.status(200).json({ addresses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateAddress = async (req, res) => {
  const userID = req.userID;
  const { addressID } = req.params;
  const { city, pincode, state, address_line } = req.body;

  try {
    await db.execute(
      `UPDATE Addresses 
       SET city = ?, pincode = ?, state = ?, address_line = ?
       WHERE addressID = ? AND userID = ?`,
      [city, pincode, state, address_line, addressID, userID]
    );

    res.status(200).json({ message: "Address updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteAddress = async (req, res) => {
  const userID = req.userID;
  const { addressID } = req.params;

  try {
    await db.execute(
      "DELETE FROM Addresses WHERE addressID = ? AND userID = ?",
      [addressID, userID]
    );

    res.status(200).json({ message: "Address deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// User Cart Routes -------------------------------------------------------------------------------

const addItem = async (req, res) => {
  const variantID = req.params.variantID;
  const { quantity = 1 } = req.body;
  const userID = req.userID;

  if (!variantID || quantity <= 0) {
    return res.status(400).json({ error: "Invalid variantID or quantity" });
  }

  try {
    const [items] = await db.execute("SELECT * FROM CartItems WHERE userID = ? AND variantID = ?",
      [userID, variantID]
    )

    // If item is already added to card increase quantity
    if(items.length !== 0){
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

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteItem = async (req, res) => {
  const variantID = req.params.variantID;
  const userID = req.userID;

  if (!variantID) {
    return res.status(400).json({ error: "Invalid variantID" });
  }

  try {
    await db.execute("DELETE FROM CartItems WHERE userID = ? AND variantID = ?",
      [userID, variantID]
    )

    return res.status(200).json({ message: "Items deleted from cart" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateQuantity = async (req, res) => {
  const variantID = req.params.variantID;
  const { quantity } = req.body;
  const userID = req.userID;

  if (!variantID || quantity <= 0) {
    return res.status(400).json({ error: "Invalid variantID or quantity" });
  }

  try {
    const [results] = await db.execute("UPDATE CartItems SET quantity = ? WHERE userID = ? AND variantID = ?",
      [quantity, userID, variantID]
    );

    if(results.affectedRows === 0){
      return res.status(400).json({ error: "Cart Item not found"});
    }

    return res.status(200).json({ message: "Item quantity updated" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getCart = async (req, res) => {
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

    res.json(cartItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export {
  generateTokens,
  registerUser,
  loginUser,
  refreshUser,
  logoutUser,
  getAllUsers,
  getProfile,
  addAddress,
  getAddress,
  updateAddress,
  deleteAddress,
  addItem,
  deleteItem,
  updateQuantity,
  getCart
}