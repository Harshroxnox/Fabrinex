import {Router} from 'express'
import {
    createOrder,
    getOrder,
    getOrdersByUser,
    getAllOrders,
    createOrderOffline,
    filter,
    updateOrderOffline,
    getSingleOrder,
    getReturnsByDateRange,
    exportOrdersExcel,
    updateOrderMeta,
    updateOrderPayments,
    deleteOrder,
    settleRefund
} from '../controllers/orders.controller.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// order routes
router.route("/create-order").post(authMiddleware('user'), createOrder);
router.route("/create-order-offline").post(authMiddleware('admin'), createOrderOffline);
router.route("/update-order-offline/:orderID").put(authMiddleware('admin'), updateOrderOffline);
router.route("/get-single-order/:orderID").get(authMiddleware('admin'),getSingleOrder);
router.route("/get-order/:orderID").get(getOrder);
router.route("/get-orders-user").get(authMiddleware('user'), getOrdersByUser);

router.route("/returns-by-range").get(authMiddleware('admin'), getReturnsByDateRange);
// admin specific
router.route("/get-all-orders").get(getAllOrders);
router.route("/filter").get(filter);

router.route("/export-excel").get(exportOrdersExcel);


router.route("/update-order-meta/:orderID").put(authMiddleware('admin'), updateOrderMeta);
router.route("/update-order-payments/:orderID").put(authMiddleware('admin'), updateOrderPayments);
router.route("/delete-order/:orderID").delete(authMiddleware('admin') , deleteOrder);
router.route('/settle-refund/:orderID').post(authMiddleware('admin'), settleRefund);


export default router;
