import { Router} from "express";
import { addPromotion, updatePromotion, getAllPromotions ,applyPromotions} from "../controllers/promotions.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

// promotion code routes
router.route("/add-promotion").post(addPromotion);
router.route("/update-promotion/:promotionID").put(updatePromotion);
router.route("/get-all-promotions").get(getAllPromotions);
router.route("/apply-promotion/:orderID").post(authMiddleware('user'),applyPromotions);

export default router;