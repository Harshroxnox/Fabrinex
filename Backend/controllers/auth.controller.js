import { db } from '../index.js';

import {
  generateOTP,
  storeOTPTemp,
  verifyStoredOTP,
  sendOtpByEmail,
  sendOtpBySMS,
  deleteStoredOTP,
  markOTPVerified,
} from '../utils/otp.helper.js';

export const sendOtpEmail = async (req, res) => {
    const { email } = req.body;
    try {
        const [existingUser] = await db.execute("SELECT * FROM Users WHERE email = ?", [email]);
        if (existingUser.length > 0)
            return res.status(400).json({ message: "User already exists" });

        const otp = generateOTP();
        console.log('otp is',otp);

        await storeOTPTemp(email, otp);
        await sendOtpByEmail(email, otp);

        res.status(200).json({ message: "OTP sent successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const verifyOtpEmail = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const isValid = await verifyStoredOTP(email, otp);
    if (!isValid) return res.status(400).json({ message: "Invalid or expired OTP" });

    await deleteStoredOTP(email);
    await markOTPVerified(email);

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const sendOtpPhone = async (req, res) => {
    const { phone_number } = req.body;
    try {
        const [existingUser] = await db.execute("SELECT * FROM Users WHERE phone_number = ?", [phone_number]);
        if (existingUser.length > 0)
            return res.status(400).json({ message: "User already exists" });

        const otp = generateOTP();
        console.log('otp is',otp);

        await storeOTPTemp(phone_number, otp);
        await sendOtpBySMS(phone_number, otp);

        res.status(200).json({ message: "OTP sent successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const verifyOtpPhone = async (req, res) => {
  const { phone_number, otp } = req.body;
  
  try {
    const isValid = await verifyStoredOTP(phone_number, otp);
    if (!isValid) return res.status(400).json({ message: "Invalid or expired OTP" });

    await deleteStoredOTP(phone_number);
    await markOTPVerified(phone_number);

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


