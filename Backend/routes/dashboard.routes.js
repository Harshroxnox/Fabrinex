import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getBestSellingPricePerVariant, getMetrics } from "../controllers/dashboard.controller.js";

const router = Router();

router.route("/get-metrics").get(authMiddleware('admin'), getMetrics);

router.route("/best-selling-prices").get(authMiddleware('admin'),getBestSellingPricePerVariant );
export default router;