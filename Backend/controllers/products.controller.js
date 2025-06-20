import { db } from '../index.js'; 
import { constants } from '../config/constants.js';
import { uploadOnCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';
import { generateUniqueBarcode } from '../utils/generateBarcode.js';

// product controller 

const createProduct = async (req, res) => {
    const { name, description, category } = req.body;

    // check if category is valid
    if (!constants.PRODUCT_CATEGORIES.includes(category)) {
        return res.status(400).json({
            success: false,
            message: `Invalid category. Must be one of: ${constants.PRODUCT_CATEGORIES.join(', ')}`,
        });
    }
    // check if description is valid JSON object
    if (!(typeof description === 'object' && description !== null && !Array.isArray(description))){
        return res.status(400).json({
            success: false,
            message: `Description must be a valid JSON Object`,
        });
    }

    try {
        const [result] = await db.execute(
            "INSERT INTO Products (name, description, category) VALUES (?, ?, ?)", 
            [name, description, category]
        );
        res.status(201).json({ message: "Product created", productID: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const updateProduct = async (req, res) => {
    const { name, description, category } = req.body;

    // check if category is valid
    if (!constants.PRODUCT_CATEGORIES.includes(category)) {
        return res.status(400).json({
            success: false,
            message: `Invalid category. Must be one of: ${constants.PRODUCT_CATEGORIES.join(', ')}`,
        });
    }
    // check if description is valid JSON object
    if (!(typeof description === 'object' && description !== null && !Array.isArray(description))){
        return res.status(400).json({
            success: false,
            message: `Description must be a valid JSON Object`,
        });
    }

    try {
        const [result] = await db.execute(
            "UPDATE Products SET name=?, description=?, category=? WHERE productID=?", 
            [name, description, category, req.params.productID]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: "Product not found" });
        res.json({ message: "Product updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const getProductById = async (req, res) => {
    try {
        const [product] = await db.execute(
            "SELECT *, (cumulative_rating / NULLIF(people_rated, 0)) AS average_rating FROM Products WHERE productID = ?", 
            [req.params.productID]
        );

        if (product.length === 0) return res.status(404).json({ message: "Product not found" });

        res.json(product[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const getAllProducts = async (req, res) => {
    try {
        const [products] = await db.execute("SELECT *, (cumulative_rating / NULLIF(people_rated, 0)) AS average_rating FROM Products");
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const deleteProduct = async (req, res) => {
    try {
        const [result] = await db.execute("DELETE FROM Products WHERE productID=?", [req.params.productID]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Product not found" });
        res.json({ message: "Product deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const reviewProduct = async (req, res) => {
    const { rating, review } = req.body;
    const userID = req.userID;
    const productID = req.params.productID;

    // Validate rating (must be 1-5)
    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    try {
        //  Check if user has purchased any variant of the product
        const [rows] = await db.execute(`
            SELECT COUNT(*) AS bought
            FROM Orders o
            JOIN OrderItems oi ON o.orderID = oi.orderID
            JOIN ProductVariants pv ON oi.productVariantID = pv.variantID
            WHERE o.userID = ?
              AND pv.productID = ?
              AND o.order_status = 'delivered'
        `, [userID, productID]);
        

        if (rows[0].bought == 0) {
            return res.status(403).json({ message: "You can only review products you have purchased" });
        }

        // Check if the user has already reviewed this product for this order
        const [existingReview] = await db.execute(
            "SELECT * FROM Reviews WHERE userID = ? AND productID = ?",
            [userID, productID]
        );

        if (existingReview.length > 0) {
            return res.status(400).json({ 
                message: "You have already reviewed this product. Go to edit review if you want to change review." 
            });
        }

        // Insert the new review
        await db.execute(
            "INSERT INTO Reviews (userID, productID, rating, review) VALUES (?, ?, ?, ?)",
            [userID, productID, rating, review || null] // Allow null for review text
        );

        // Update cumulative rating and people rated in Products table
        await db.execute(
            "UPDATE Products SET cumulative_rating = cumulative_rating + ?, people_rated = people_rated + 1 WHERE productID = ?",
            [rating, productID]
        );

        res.status(201).json({ message: "Review submitted successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const updateReview = async (req, res) => {
    const { rating, review } = req.body;
    const userID = req.userID;
    const productID = req.params.productID;

    // Validate rating (must be 1-5)
    if (rating && (rating < 1 || rating > 5)) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    try {
        // Check if the user has already reviewed this product
        const [existingReview] = await db.execute(
            "SELECT * FROM Reviews WHERE userID = ? AND productID = ?",
            [userID, productID]
        );

        if (existingReview.length === 0) {
            return res.status(404).json({ message: "No review found for this product." });
        }

        // Get old rating to adjust cumulative rating in Products table
        const oldRating = existingReview[0].rating;

        // Update review and rating
        await db.execute(
            "UPDATE Reviews SET rating = ?, review = ? WHERE userID = ? AND productID = ?",
            [rating || oldRating, review || existingReview[0].review, userID, productID]
        );

        //  Update cumulative rating in Products table        
        const ratingDifference = rating - oldRating;
        await db.execute(
            "UPDATE Products SET cumulative_rating = cumulative_rating + ? WHERE productID = ?",
            [ratingDifference, productID]
        );
        res.status(200).json({ message: "Review updated successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const deleteReview = async (req, res) => {
    const userID = req.userID;
    const productID = req.params.productID;
    
    try {
        // Check if the user has already reviewed this product
        const [existingReview] = await db.execute(
            "SELECT * FROM Reviews WHERE userID = ? AND productID = ?",
            [userID, productID]
        );

        if (existingReview.length === 0) {
            return res.status(404).json({ message: "No review found for this product." });
        }

        // Get old rating to adjust cumulative rating in Products table
        const ratingToSubtract = existingReview[0].rating;

        // Delete the review and update cummulative stats
        await db.execute(
            "DELETE FROM Reviews WHERE userID = ? AND productID = ?",
            [userID, productID]
        );
        await db.execute(
            `UPDATE Products SET cumulative_rating = cumulative_rating - ?, people_rated = people_rated - 1 WHERE productID = ?`,
            [ratingToSubtract, productID]
        );
        
        res.status(200).json({ message: "Review deleted successfully." });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Variant Controller 

const createVariant = async (req, res) => {
    const { color, size, price, discount, stock } = req.body;
    const mainImgPath = req.file ? req.file.path : null;
    
    try {
        let mainImgCloudinaryUrl;

        if(mainImgPath){
           const mainImgCloudinary = await uploadOnCloudinary(mainImgPath);
           mainImgCloudinaryUrl=mainImgCloudinary.url;
        }
        
        const barcode = await generateUniqueBarcode();

        const [result] = await db.execute(
            "INSERT INTO ProductVariants (productID, color, size, price, discount, stock,main_image,barcode) VALUES (?, ?, ?, ?, ?, ?,?,?)", 
            [req.params.productID, color, size, price, discount, stock,mainImgCloudinaryUrl,barcode]
        );
        res.status(201).json({ message: "Variant created", variantID: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const updateVariant = async (req, res) => {
    const { price, discount, stock } = req.body;
    const mainImgPath = req.file ? req.file.path : null;
    const fields = { price, discount, stock };

    try {
        // If image is provided, upload to Cloudinary
        if (mainImgPath) {
            const uploadedImage = await uploadOnCloudinary(mainImgPath);
            if (uploadedImage && uploadedImage.url) {
                fields.main_image = uploadedImage.url;
            }
        }

        // Filter only fields that are provided (not undefined)
        const keys = Object.keys(fields).filter(key => fields[key] !== undefined);

        if (keys.length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }

        // Construct the SET clause dynamically
        const setClause = keys.map(key => `${key} = ?`).join(', ');
        const values = keys.map(key => fields[key]);

        // Add variantID for the WHERE clause
        values.push(req.params.variantID);

        const [result] = await db.execute(
            `UPDATE ProductVariants SET ${setClause} WHERE variantID = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Variant not found" });
        }

        res.json({ message: "Variant updated successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const getVariantsByProduct = async (req, res) => {
    try {
        const [variants] = await db.execute("SELECT * FROM ProductVariants WHERE productID = ?", [req.params.productID]);
        res.json(variants);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const getVariantById = async (req, res) => {
    try {
        const [variant] = await db.execute("SELECT * FROM ProductVariants WHERE variantID = ?", [req.params.variantID]);
        res.json(variant);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const deleteVariant = async (req, res) => {
    try {
        const [result] = await db.execute("DELETE FROM ProductVariants WHERE variantID=?", [req.params.variantID]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Variant not found" });
        res.json({ message: "Variant deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const uploadSecondaryImages = async (req, res) => {
    const files = req.files;
    const variantID = req.params.variantID;

    try {
        let uploadResults = [];

        // Upload the images on cloudinary and get the url
        if (files && files.length > 0) {
            const uploadPromises = files.map(file => uploadOnCloudinary(file.path));
            uploadResults = await Promise.all(uploadPromises);
        }

        // If Upload fails skip DB insertion
        if (uploadResults.length === 0) {
            return res.status(400).json({ error: "No files were uploaded." });
        }

        // Insert the Images into VariantImages
        const insertPromises = uploadResults.map(async (result) => {
            const [output] = await db.execute(
                "INSERT INTO VariantImages (variantID, image_url, cloudinary_id) VALUES (?, ?, ?)",
                [variantID, result.url, result.public_id]
            );

            return {
                variantImageID: output.insertId,
                image_url: result.url
            };
        });

        const insertedImages = await Promise.all(insertPromises);

        res.status(200).json({
            message: "Secondary images uploaded successfully",
            images: insertedImages
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const deleteSecondaryImage = async (req, res) => {
    const { variantImageID } = req.params;

    if (!variantImageID || isNaN(variantImageID)) {
        return res.status(400).json({ error: "Invalid or missing image ID." });
    }

    try {
        // Get image info from DB
        const [rows] = await db.execute(
            "SELECT cloudinary_id FROM VariantImages WHERE variantImageID = ?",
            [variantImageID]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Image not found." });
        }

        const cloudinaryID = rows[0].cloudinary_id;

        // Delete from Cloudinary
        const result = await deleteFromCloudinary(cloudinaryID);

        if (result.result !== "ok") {
            return res.status(500).json({ error: "Failed to delete image from Cloudinary." });
        }

        // Delete from DB
        await db.execute(
            "DELETE FROM VariantImages WHERE variantImageID = ?",
            [variantImageID]
        );

        res.status(200).json({ message: "Image deleted successfully." });

    } catch (err) {
        console.error("Delete error:", err);
        res.status(500).json({ error: "An error occurred while deleting the image." });
    }
};


export {
    createProduct,
    updateProduct,
    reviewProduct,
    updateReview,
    deleteReview,
    getProductById,
    getAllProducts,
    deleteProduct,
    createVariant,
    updateVariant,
    getVariantsByProduct,
    getVariantById,
    uploadSecondaryImages,
    deleteSecondaryImage,
    deleteVariant
}