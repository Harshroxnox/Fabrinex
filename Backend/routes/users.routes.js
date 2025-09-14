import { Router } from "express";
import { 
    registerUser,
    loginUser,
    refreshUser,
    logoutUser, 
    getProfile, 
    getAllUsers,
    getUserByName,
    addAddress,
    getAddress,
    updateAddress,
    deleteAddress,
    addItem,
    deleteItem,
    updateQuantity,
    getCart
} from "../controllers/users.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

// user routes
router.route("/register").post(upload.single("profile_img"), registerUser);
router.route("/login").post(loginUser);
router.route("/refresh").post(refreshUser);
router.route("/logout").post(logoutUser);
router.route("/get-profile").get(authMiddleware('user'), getProfile);

// admin routes 
router.route("/get-all-users").get(getAllUsers);
router.route("/get-user-by-name").get(getUserByName);

// user address routes (user must be logged in)
router.route("/add-address").post(authMiddleware('user'), addAddress);
router.route("/get-address").get(authMiddleware('user'), getAddress);
router.route("/update-address/:addressID").put(authMiddleware('user'), updateAddress);
router.route("/delete-address/:addressID").delete(authMiddleware('user'), deleteAddress);

// user cart routes
router.route("/cart/add-item/:variantID").post(authMiddleware('user'), addItem);
router.route("/cart/delete-item/:variantID").delete(authMiddleware('user'), deleteItem);
router.route("/cart/update-quantity/:variantID").put(authMiddleware('user'), updateQuantity);
router.route("/cart/get-cart").get(authMiddleware('user'), getCart);

export default router