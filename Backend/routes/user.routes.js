import { Router } from "express";
import { registerUser,loginUser,refresh,logoutUser, getProfile} from "../controllers/user.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { upload } from "../middleware/multer.middleware.js";


const router = Router()

router.route("/register").post(upload.single("profile_img"), registerUser);
router.route("/login").post(loginUser)
router.route("/refresh").post(refresh)
router.route("/logout").post(logoutUser);
router.route("/getprofile").get(authMiddleware,getProfile)

export default router 