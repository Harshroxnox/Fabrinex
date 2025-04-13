import express from "express";
import { sendOtpEmail, verifyOtpEmail, sendOtpPhone, verifyOtpPhone } from "../controllers/auth.controller.js";

const router = express.Router();

router.route("/send-otp-email").post(sendOtpEmail);
router.route("/verify-otp-email").post(verifyOtpEmail);
router.route("/send-otp-phone").post(sendOtpPhone);
router.route("/verify-otp-phone").post(verifyOtpPhone);

export default router;
