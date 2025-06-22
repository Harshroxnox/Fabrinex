import express from "express";
import { getMessageTemplates } from "../controllers/marketing.controller.js"

const router = express.Router();

// Get Message Templates
router.route("/get-message-templates").get(getMessageTemplates);

// NodeMailer Email Bulk Marketing routes
// SMS FastAPI Bulk Messaging routes
// Twilio Whatsapp Bulk Messaging routes

export default router;
