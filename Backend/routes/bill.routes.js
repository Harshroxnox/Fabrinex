import { uploadPdf } from "../middleware/multer.middleware.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { Router } from "express";
import {uploadBill} from "../controllers/bills.controller.js"
import { deleteBill } from "../controllers/bills.controller.js";

const router=Router();

router.route("/upload-bill").post(authMiddleware('admin'),uploadPdf.single("bill-pdf"),uploadBill);
router.route("/delete-bill/:id").delete(authMiddleware('admin'),deleteBill)
export default router;
