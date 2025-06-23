import { Router} from "express";
import { addPromotion, updatePromotion, deletePromotion, getAllPromotions } from "../controllers/promotions.controller.js";

const router = Router();

// promotion code routes
router.route("/add-promotion").post(addPromotion);
router.route("/update-promotion/:promotionID").put(updatePromotion);
router.route("/delete-promotion/:promotionID").delete(deletePromotion);
router.route("/get-all-promotions").get(getAllPromotions);

export default router;