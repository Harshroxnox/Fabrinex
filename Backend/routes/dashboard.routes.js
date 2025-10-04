import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getBestSellingPricePerVariant, getMetrics, getTodaysMetrics } from "../controllers/dashboard.controller.js";

const router = Router();

router.route("/get-metrics").get(authMiddleware('admin'), getMetrics);
router.route("/todays-metrics").get(authMiddleware('admin'), getTodaysMetrics);
router.route("/best-selling-prices").get(authMiddleware('admin'),getBestSellingPricePerVariant );
export default router;