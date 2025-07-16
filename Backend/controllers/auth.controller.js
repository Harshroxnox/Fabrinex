import AppError from '../errors/appError.js';
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
import { validEmail, validPhoneNumber } from '../utils/validators.utils.js';

export const sendOtpEmail = async (req, res, next) => {
  //validate email
  const email = validEmail(req.body.email);
  
  try {

    if (email === null) {
      throw new AppError(422, "Invalid email provided");
    }
    
    const [existingUser] = await db.execute("SELECT * FROM Users WHERE email = ?", [email]);
    if (existingUser.length > 0)
      throw new AppError(400, "User already exists");

    const otp = generateOTP();

    await storeOTPTemp(email, otp);
    await sendOtpByEmail(email, otp);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    next(error);
  }
};

export const verifyOtpEmail = async (req, res, next) => {
  const { email, otp } = req.body;

  try {
    const isValid = await verifyStoredOTP(email, otp);
    if (!isValid) throw new AppError(400, "Invalid or expired OTP");

    await deleteStoredOTP(email);
    await markOTPVerified(email);

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    next(error);
  }
};

export const sendOtpPhone = async (req, res, next) => {
  
  //phone number validation
  const phone_number = validPhoneNumber(req.body.phone_number);
  try {

    if (phone_number === null) {
      throw new AppError(422, 'Invalid phone number');
    }
    // logger.info("Valid phone number :",phone_number);
    const [existingUser] = await db.execute("SELECT * FROM Users WHERE phone_number = ?", [phone_number]);
    if (existingUser.length > 0)
      throw new AppError(400, 'User already exists');

    const otp = generateOTP();

    await storeOTPTemp(phone_number, otp);
    await sendOtpBySMS(phone_number, otp);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    next(error);
  }
};

export const verifyOtpPhone = async (req, res, next) => {
  const { phone_number, otp } = req.body;
  
  try {
    const isValid = await verifyStoredOTP(phone_number, otp);
    if (!isValid) throw new AppError(400, "Invalid or expired OTP");

    await deleteStoredOTP(phone_number);
    await markOTPVerified(phone_number);

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    next(error);
  }
};


