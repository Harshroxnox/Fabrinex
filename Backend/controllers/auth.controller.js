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
import { validEmail, validPhoneNumber, validWholeNo } from '../utils/validators.utils.js';

export const sendOtpEmail = async (req, res) => {
  const { email } = req.body;
  
  //validate email
  if(validEmail(email)===null){
    return res.status(422).json({error:'Invalid Email provided'});
  }
    
  try {
    const [existingUser] = await db.execute("SELECT * FROM Users WHERE email = ?", [email]);
    if (existingUser.length > 0)
      return res.status(400).json({ error: "User already exists" });

    const otp = generateOTP();

    await storeOTPTemp(email, otp);
    await sendOtpByEmail(email, otp);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending otp email:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const verifyOtpEmail = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const isValid = await verifyStoredOTP(email, otp);
    if (!isValid) return res.status(400).json({ error: "Invalid or expired OTP" });

    await deleteStoredOTP(email);
    await markOTPVerified(email);

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying otp email:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const sendOtpPhone = async (req, res) => {
  const { phone_number } = req.body;
  //phone number validation
  const validatedPhoneNumber= validPhoneNumber(phone_number);

  if(!validatedPhoneNumber){
    return res.status(422).json({error:'Invalid phone number'});
  }
  console.log("valid :",validatedPhoneNumber);
  req.body.phone_number= validatedPhoneNumber;


  try {
    const [existingUser] = await db.execute("SELECT * FROM Users WHERE phone_number = ?", [phone_number]);
    if (existingUser.length > 0)
      return res.status(400).json({ error: "User already exists" });

    const otp = generateOTP();

    await storeOTPTemp(phone_number, otp);
    await sendOtpBySMS(phone_number, otp);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending otp phone:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const verifyOtpPhone = async (req, res) => {
  const { phone_number, otp } = req.body;
  
  try {
    const isValid = await verifyStoredOTP(phone_number, otp);
    if (!isValid) return res.status(400).json({ error: "Invalid or expired OTP" });

    await deleteStoredOTP(phone_number);
    await markOTPVerified(phone_number);

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying otp phone:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


