import { Router } from "express";
import { registerUser,loginUser,refresh,logoutUser, getProfile, getAllUsers} from "../controllers/user.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router()

// user routes
router.route("/register").post(upload.single("profile_img"), registerUser);
router.route("/login").post(loginUser)
router.route("/refresh").post(refresh)
router.route("/logout").post(logoutUser);
router.route("/get-profile").get(authMiddleware, getProfile);
router.route("/get-all-users").get(getAllUsers);

// user address routes
// user payment routes
// user cart routes

export default router