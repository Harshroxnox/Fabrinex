import express from "express";
import { sendOtpEmail, verifyOtpEmail, sendOtpPhone, verifyOtpPhone } from "../controllers/auth.controller.js";

const router = express.Router();

router.route("/send-otp-email").post(sendOtpEmail);
router.route("/verify-otp-email").post(verifyOtpEmail);
// SMS library is not yet integrated so this does not work
router.route("/send-otp-phone").post(sendOtpPhone);
router.route("/verify-otp-phone").post(verifyOtpPhone);

export default router;
