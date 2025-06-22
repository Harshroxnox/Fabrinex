import { Router } from "express";
import { 
    registerUser,
    loginUser,
    refreshUser,
    logoutUser, 
    getProfile, 
    getAllUsers,
    addAddress,
    getAddress,
    updateAddress,
    deleteAddress
} from "../controllers/users.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router()

// user routes
router.route("/register").post(upload.single("profile_img"), registerUser);
router.route("/login").post(loginUser)
router.route("/refresh").post(refreshUser)
router.route("/logout").post(logoutUser);
router.route("/get-profile").get(authMiddleware, getProfile);

// admin routes 
router.route("/get-all-users").get(getAllUsers);

// user address routes (user must be logged in)
router.route("/add-address").post(authMiddleware, addAddress);
router.route("/get-address").get(authMiddleware, getAddress);
router.route("/update-address/:addressID").put(authMiddleware, updateAddress);
router.route("/delete-address/:addressID").delete(authMiddleware, deleteAddress);

// user cart routes

export default router