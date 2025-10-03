import { Router } from "express";
import { createPurchase, getAllPurchases, getPurchaseById, searchPurchasesByDateRange, searchPurchasesBySeller } from "../controllers/purchases.controllers.js";

const router = Router();
router.route("/create-purchase").post(createPurchase);
router.route("/get-all-purchases").get(getAllPurchases);
router.route("/get-purchase-by-id/:purchaseID").get(getPurchaseById);
router.route("/search-by-seller").get(searchPurchasesBySeller);
router.route("/search/date-range").get(searchPurchasesByDateRange);
export default router;