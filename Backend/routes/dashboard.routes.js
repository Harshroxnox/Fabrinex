import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getMetrics } from "../controllers/dashboard.controller.js";

const router = Router();

router.route("/get-metrics").get(authMiddleware('admin'), getMetrics);

export default router;