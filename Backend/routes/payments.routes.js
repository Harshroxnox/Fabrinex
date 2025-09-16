import { Router } from "express";
import { authMiddleware } from '../middleware/authMiddleware.js';
import { createOrder, verifyPayment } from "../controllers/payments.controller.js";


const router = Router();

// Normal payment routes/flow
router.route("/create-order").post(authMiddleware('user'), createOrder);
router.route("/verfiy").post(authMiddleware('user'), verifyPayment);

export default router;