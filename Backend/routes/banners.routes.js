import { Router} from "express";
import { addMainBanner, getBanner,deleteBanner, getAllBanners, updateMainBanner, addSideBanner, updateSideBanner } from "../controllers/banners.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

//Main Banner
router.route("/add-main-banner").post(upload.single("banner_img"), addMainBanner);
router.route("/update-main-banner/:bannerID").put(updateMainBanner);

//Side Banner
router.route("/add-side-banner").post(upload.single("banner_img"), addSideBanner);
router.route("/update-side-banner/:bannerID").put(updateSideBanner);

//Common
router.route("/get-banner/:bannerID").get(getBanner);
router.route("/get-all-banners").get(getAllBanners);
router.route("/delete-banner/:bannerID").delete(deleteBanner);

export default router;