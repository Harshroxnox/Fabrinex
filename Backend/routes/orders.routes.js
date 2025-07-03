import {Router} from 'express'
import {
    createOrder,
    getOrder,
    getOrdersByUser,
    getAllOrders,
} from '../controllers/orders.controller.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// order routes
router.route("/create-order").post(authMiddleware, createOrder);
router.route("/get-order/:orderID").get(getOrder);
router.route("/get-orders-user").get(authMiddleware, getOrdersByUser);

// admin specific
router.route("/get-all-orders").get(getAllOrders);

export default router;
