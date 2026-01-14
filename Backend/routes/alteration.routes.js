import { Router } from 'express'
import {
    createAlteration,
    getAlterations,
    getAlterationNotifications,
    updateAlterationStatus,
    updateAlteration,
    deleteAlteration,

} from '../controllers/alteration.controller.js';
import { authMiddleware, checkAdminRoles } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/multer.middleware.js';

const router = Router();

// product routes
router.route("/create-alteration").post(authMiddleware('admin'),upload.single("dimension_image"),createAlteration);
router.route("/update-alteration-status/:alterationID").put(authMiddleware('admin'),updateAlterationStatus);
router.route("/get-alteration").get(authMiddleware('admin'),getAlterations);
router.route("/get-alteration-notifications").get(authMiddleware('admin'),getAlterationNotifications);
router.route("/update-alteration/:alterationID").put(authMiddleware('admin'), upload.single("dimension_image"), updateAlteration);
router.route("/delete-alteration/:alterationID").delete(authMiddleware('admin'), deleteAlteration);
export default router