import { redis } from '../index.js';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { emailOtpTemplate } from '../config/messages.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Generate 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTP with 5-minute expiry
export const storeOTPTemp = async (emailOrPhone, otp) => {
  const key = `otp:${emailOrPhone}`;
  const res = await redis.set(key, otp, 'EX', 300); // 5 minutes
  console.log("storeOTPTemp:", res);
};

// Verify OTP
export const verifyStoredOTP = async (emailOrPhone, otp) => {
  const key = `otp:${emailOrPhone}`;
  const storedOTP = await redis.get(key);
  return storedOTP == otp;
};

// Delete OTP after verification
export const deleteStoredOTP = async (emailOrPhone) => {
  const key = `otp:${emailOrPhone}`;
  await redis.del(key);
};

// Check if OTP was verified for both email and phone before registering
export const isOTPVerified = async (email, phone_number) => {
  const key_email = `otp_verified:${email}`;
  const verified_email = await redis.get(key_email);

  const key_phone = `otp_verified:${phone_number}`;
  const verified_phone = await redis.get(key_phone);
  
  if(verified_email || verified_phone){
    return true;
  }
  return false;
};

// After successful OTP verification, mark it verified
export const markOTPVerified = async (emailOrPhone) => {  
  const identifier = emailOrPhone;
  if (!identifier) {
    throw new Error("Email or phone number is required to mark OTP as verified");
  }

  const key = `otp_verified:${identifier}`;
  await redis.set(key, 'true', 'EX', 600); // 10 mins
};
  

// -------------- OTP SENDING LOGIC --------------

export const sendOtpByEmail = async (email, otp) => {
  const mailOptions = {
    from: `"E-Commerce Storefront" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Confirmation OTP for your E-Commerce Account',
    html: emailOtpTemplate(otp),
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('OTP sent via email:', info.response);
};
  
export const sendOtpBySMS = async (phone_number, otp) => {
  const message = await twilioClient.messages.create({
    body: `Your OTP is ${otp}. It is valid for 5 minutes.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    // Assuming we have have to send SMS in India only
    to: "+91" + phone_number,
  });

  console.log('OTP sent via SMS:', message.sid);
};
  