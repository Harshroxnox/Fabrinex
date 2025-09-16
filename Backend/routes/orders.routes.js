import {Router} from 'express'
import {
    createOrder,
    getOrder,
    getOrdersByUser,
    getAllOrders,
    createOrderOffline,
    filter
} from '../controllers/orders.controller.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// order routes
router.route("/create-order").post(authMiddleware('user'), createOrder);
router.route("/create-order-offline").post(authMiddleware('admin'), createOrderOffline);
router.route("/get-order/:orderID").get(getOrder);
router.route("/get-orders-user").get(authMiddleware('user'), getOrdersByUser);

// admin specific
router.route("/get-all-orders").get(getAllOrders);
router.route("/filter").get(filter);

export default router;
