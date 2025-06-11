import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { 
    registerAdmin,
    loginAdmin,
    refreshAdmin,
    logoutAdmin,
    getAllAdmins,
    getRoleAdmin,
    updateAdmin,
    deleteAdmin
} from "../controllers/adminUsers.controller.js";

const router = Router()

// Routes for AdminUsers and AdminRoles
router.route("/register").post(registerAdmin);
router.route("/login").post(loginAdmin);
router.route("/refresh").post(refreshAdmin);
router.route("/logout").post(logoutAdmin);
router.route("/update/:adminID").put(updateAdmin);
router.route("/delete/:adminID").delete(deleteAdmin);
router.route("/get-all-admins").get(getAllAdmins);
router.route("/get-roles").get(authMiddleware, getRoleAdmin);

export default router
