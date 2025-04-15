import {Router} from 'express'
import {
    createProduct,
    reviewProduct,
    editReview,
    getProductById,
    getAllProducts,
    updateProduct,
    deleteProduct,
    createVariant,
    updateVariant,
    getVariantsByProduct,
    deleteVariant, 
    getVariantById
} from '../controllers/product.controller.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router =Router()

// product routes
router.route("/create-product").post(createProduct);
router.route("/update-product/:productID").put(updateProduct);
router.route("/get-product/:productID").get(getProductById);
router.route("/get-all-products").get(getAllProducts);
router.route('/delete-product/:productID').delete(deleteProduct);

//-----------------------------------NEED TO WORK FROM HERE-------------------------------------------

// address routes
// order routes

// product review routes
router.route("/review-product/:productID").post(authMiddleware, reviewProduct);
router.route("/edit-review/:productID").post(authMiddleware, editReview);

// product variant routes
router.route('/createvariant/:productID').post(createVariant);
router.route('/updatevariant/:variantID').put(updateVariant);
router.route('/getvariants/:productID').get(getVariantsByProduct);
router.route('/getvariant/:variantID').get(getVariantById);
router.route('/deletevariant/:variantID').delete(deleteVariant);

// product image routes

export default router