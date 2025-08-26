import { Router } from "express";
import { createLoyaltyCard, deleteLoyaltyCard, getLoyaltyCards } from "../controllers/loyaltycards.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();


router.route("/create").post(authMiddleware('admin'), createLoyaltyCard);
router.route("/delete/:barcode").delete(authMiddleware('admin'), deleteLoyaltyCard);
router.route("/get-all-loyaltycards").get(authMiddleware('admin'), getLoyaltyCards);

export default router;
