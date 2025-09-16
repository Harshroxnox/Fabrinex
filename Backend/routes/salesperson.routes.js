import { Router } from "express";
import { addSalesperson, deleteSalesperson, getAllSalesPersons, updateCommission, salesPersonOrders } from "../controllers/salesperson.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.route("/add-salesperson").post(authMiddleware('admin'),addSalesperson);
router.route("/update-commission/:salesPersonID").put(authMiddleware('admin'), updateCommission);
router.route("/delete-salesperson/:salesPersonID").delete(authMiddleware('admin') ,deleteSalesperson);
router.route("/get-all-salespersons").get(authMiddleware('admin'), getAllSalesPersons);

// Salesperson info
router.route("/salesperson-orders/:salesPersonID").get(authMiddleware('admin'), salesPersonOrders);

export default router
