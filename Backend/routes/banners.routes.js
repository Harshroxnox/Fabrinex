import { Router} from "express";
import { addBanner, getBanner,deleteBanner, getAllBanners } from "../controllers/banners.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

router.route("/add-banner").post(upload.single("banner_img"), addBanner);
router.route("/get-banner/:bannerID").get(getBanner);
router.route("/get-all-banners").get(getAllBanners);
router.route("/delete-banner/:bannerID").delete(deleteBanner);

export default router;