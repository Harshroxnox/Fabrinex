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
    productVariantImages,
    updateSecondaryImage,
    getVariantById
} from '../controllers/product.controller.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { upload } from '../middleware/multer.middleware.js';

const router =Router()

// product routes
router.route("/create-product").post(createProduct);
router.route("/update-product/:productID").put(updateProduct);
router.route("/get-product/:productID").get(getProductById);
router.route("/get-all-products").get(getAllProducts);
router.route('/delete-product/:productID').delete(deleteProduct);

// product review routes
router.route("/review-product/:productID").post(authMiddleware, reviewProduct);
router.route("/edit-review/:productID").post(authMiddleware, editReview);

// product variant routes
router.route('/create-variant/:productID').post(upload.single("main_image"),createVariant);
router.route('/get-variant/:variantID').get(getVariantById);
router.route('/update-variant/:variantID').put(upload.single("main_image"),updateVariant);
router.route('/delete-variant/:variantID').delete(deleteVariant);
router.route('/get-variants/:productID').get(getVariantsByProduct);
router.route('/upload-secondary-image/:variantID').post(upload.array("images",5),productVariantImages)
router.route('/update-secondary-image/:productImageID').put(upload.single("secondary_image"),updateSecondaryImage)

export default router