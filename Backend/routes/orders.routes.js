import {Router} from 'express'
import {
    createOrder,
    getOrder,
    getOrdersByUser,
    getAllOrders,
    updateOrder,
    deleteOrder
} from '../controllers/orders.controller.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// order routes
router.route("/create-order").post(authMiddleware, createOrder);
router.route("/get-order/:orderID").get(getOrder);
router.route("/get-orders-user/:userID").get(getOrdersByUser);

// admin specific
router.route("/get-all-orders").get(getAllOrders);
router.route("/update-order/:orderID").put(updateOrder);
router.route("/delete-order/:orderID").delete(deleteOrder);


export default router;
