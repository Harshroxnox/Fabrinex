import { Router } from "express";
import authMiddleware from '../middleware/authMiddleware.js';
import { createOrder, verifyPayment, saveCard, chargeSavedCard, verifySavedCardPayment } from "../controllers/payments.controller.js";


const router = Router();

// Normal payment routes/flow
router.route("/create-order").post(authMiddleware, createOrder);
router.route("/save-card").post(authMiddleware, saveCard);
router.route("/verfiy").post(authMiddleware, verifyPayment);

// Saved card payment routes/flow
router.route("/charge-saved-card").post(authMiddleware, chargeSavedCard);
router.route("/verfiy-saved-card-payment").post(authMiddleware, verifySavedCardPayment);

// Card management routes
// get-cards
// delete-card

export default router;