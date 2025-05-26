import { db } from '../index.js';

import {
    generateOTP,
    storeOTPTemp,
    verifyStoredOTP,
    sendOTPToEmailOrPhone,
    deleteStoredOTP,
    markOTPVerified,
} from '../utils/otp.helper.js';

export const sendOtp = async (req, res) => {
    const { email, phone_number } = req.body;
    try {
        const [existingUser] = await db.execute("SELECT * FROM Users WHERE email = ? OR phone_number = ?", [email, phone_number]);
        if (existingUser.length > 0)
            return res.status(400).json({ message: "User already exists" });

        const otp = generateOTP();
        console.log('otp is',otp);
        await storeOTPTemp({ email, phone_number, otp });
        await sendOTPToEmailOrPhone({ email, phone_number, otp });

        res.status(200).json({ message: "OTP sent successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const verifyOtp = async (req, res) => {
    const { email, phone_number, otp } = req.body;
  
    try {
      const isValid = await verifyStoredOTP({ email, phone_number, otp });
      if (!isValid) return res.status(400).json({ message: "Invalid or expired OTP" });
  
      await deleteStoredOTP({ email, phone_number });
  
      // This was the issue - both email and phone_number might be undefined here
      await markOTPVerified({ email, phone_number });
  
      res.status(200).json({ message: "OTP verified successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  


