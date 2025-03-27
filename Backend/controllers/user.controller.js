import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { db } from '../index.js'; 


const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into database using await
        const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
        await db.execute(sql, [name, email, hashedPassword]); // Execute query properly

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("❌ Registration error:", error);
        res.status(500).json({ message: "Error registering user" });
    }
};



const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
  }

  try {
      // Check if the user exists
      const sql = "SELECT * FROM users WHERE email = ?";
      const [results] = await db.execute(sql, [email]); // Use await to fetch data

      if (results.length === 0) {
          return res.status(400).json({ message: "User not found" });
      }

      const user = results[0];

      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT Token
      const accessToken = jwt.sign(
          { id: user.id, email: user.email, role: user.role },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
      );

      res.json({
          accessToken,
          user: { id: user.id, name: user.name, email: user.email, role: user.role }
      });

  } catch (error) {
      console.error("❌ Login error:", error);
      res.status(500).json({ message: "Server error" });
  }
};



 export {
    registerUser,
    loginUser,

 }