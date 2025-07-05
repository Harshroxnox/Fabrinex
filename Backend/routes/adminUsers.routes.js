import { Router } from "express";
import { authMiddleware, checkAdminRoles } from "../middleware/authMiddleware.js";
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
router.route("/logout").post(authMiddleware('admin'), logoutAdmin);
router.route("/update/:adminID").put(authMiddleware('admin'), checkAdminRoles(['superadmin']), updateAdmin);
router.route("/delete/:adminID").delete(authMiddleware('admin'), checkAdminRoles(['superadmin']), deleteAdmin);
router.route("/get-all-admins").get(authMiddleware('admin'), checkAdminRoles(['superadmin']), getAllAdmins);
router.route("/get-roles").get(authMiddleware('admin'), getRoleAdmin);

export default router
