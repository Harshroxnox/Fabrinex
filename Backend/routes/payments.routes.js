import { Router } from "express";
import authMiddleware from '../middleware/authMiddleware.js';
import { createOrder, verifyPayment, saveCard, chargeSavedCard } from "../controllers/payments.controller.js";


const router = Router();

router.route("/create-order").post(authMiddleware, createOrder);
router.route("/verfiy").post(authMiddleware, verifyPayment);
router.route("/save-card").post(authMiddleware, saveCard);
router.route("/charge-saved-card").post(authMiddleware, chargeSavedCard);

export default router;