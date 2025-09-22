import { uploadPdf } from "../middleware/multer.middleware.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { Router } from "express";
import {getAllBills, getBillById, uploadBill} from "../controllers/bills.controller.js"
import { deleteBill } from "../controllers/bills.controller.js";

const router=Router();

router.route("/upload-bill").post(authMiddleware('admin'),uploadPdf.single("bill-pdf"),uploadBill);
router.route("/delete-bill/:id").delete(authMiddleware('admin'),deleteBill)
router.route("/get-all-bills").get(authMiddleware('admin'),getAllBills)
router.route("/get-bill/:id").get(authMiddleware('admin'),getBillById)
export default router;
