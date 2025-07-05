import { Router } from 'express'
import {
    createProduct,
    reviewProduct,
    updateReview,
    deleteReview,
    getProductById,
    getAllProducts,
    updateProduct,
    deleteProduct,
    createVariant,
    updateVariant,
    getVariantsByProduct,
    getVariantById,
    getAllVariants,
    deleteVariant, 
    uploadSecondaryImages,
    deleteSecondaryImage
} from '../controllers/products.controller.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/multer.middleware.js';

const router = Router();

// product routes
router.route("/create-product").post(createProduct);
router.route("/update-product/:productID").put(updateProduct);
router.route("/get-product/:productID").get(getProductById);
router.route("/get-all-products").get(getAllProducts);
router.route('/delete-product/:productID').delete(deleteProduct);

// product review routes
router.route("/review-product/:productID").post(authMiddleware('user'), reviewProduct);
router.route("/update-review/:productID").put(authMiddleware('user'), updateReview);
router.route("/delete-review/:productID").delete(authMiddleware('user'), deleteReview);

// product variant routes
router.route('/create-variant/:productID').post(upload.single("main_image"), createVariant);
router.route('/get-variants/:productID').get(getVariantsByProduct);
router.route('/get-variant/:variantID').get(getVariantById);
router.route('/get-all-variants').get(getAllVariants);
router.route('/update-variant/:variantID').put(upload.single("main_image"), updateVariant);
router.route('/delete-variant/:variantID').delete(deleteVariant);
router.route('/upload-secondary-images/:variantID').post(upload.array("images",5), uploadSecondaryImages); // This accepts upto max 5 images
router.route('/delete-secondary-image/:variantImageID').delete(deleteSecondaryImage);

export default router