import { Router } from "express";
import { authMiddleware } from '../middleware/authMiddleware.js';
import { createOrder, verifyPayment, saveCard, chargeSavedCard, verifySavedCardPayment, getCards, deleteCard } from "../controllers/payments.controller.js";


const router = Router();

// Normal payment routes/flow
router.route("/create-order").post(authMiddleware('user'), createOrder);
router.route("/save-card").post(authMiddleware('user'), saveCard);
router.route("/verfiy").post(authMiddleware('user'), verifyPayment);

// Saved card payment routes/flow
router.route("/charge-saved-card").post(authMiddleware('user'), chargeSavedCard);
router.route("/verfiy-saved-card-payment").post(authMiddleware('user'), verifySavedCardPayment);

// Card management routes
router.route("/get-cards").get(authMiddleware('user'), getCards);
router.route("/delete-card/:cardID").delete(authMiddleware('user'), deleteCard);

export default router;