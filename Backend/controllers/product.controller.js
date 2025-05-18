import { db } from '../index.js'; 
import { constants } from '../config/constants.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
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


const reviewProduct = async (req, res) => {
    const { rating, review } = req.body;
    const userID = req.userID;
    const productID = req.params.productID;

    // Validate rating (must be 1-5)
    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    try {
        //  Check if user has purchased the product
        const [order] = await db.execute(
            `SELECT Orders.* FROM Orders INNER JOIN ProductVariants ON ProductVariants.variantID=Orders.variantID WHERE Orders.userID = ? AND ProductVariants.productID = ?`,
            [userID, productID]
        );

        if (order.length === 0) {
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


const editReview = async (req, res) => {
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
        if (rating) {
            const ratingDifference = rating - oldRating;
            await db.execute(
                "UPDATE Products SET cumulative_rating = cumulative_rating + ? WHERE productID = ?",
                [ratingDifference, productID]
            );
        }

        res.status(200).json({ message: "Review updated successfully" });

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

    console.log(req.body)
    const { price, discount, stock } = req.body;
    const mainImgPath = req.file ? req.file.path : null;

    const fields = { price, discount, stock };

    console.log(fields);
    console.log(price)

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

const updateSecondaryImage = async (req, res) => {
    const { productImageID } = req.params;
    const file = req.file;

    try {
        if (!file) {
            return res.status(400).json({ message: "No image file provided" });
        }

        const uploadedImage = await uploadOnCloudinary(file.path);
        const newImageUrl = uploadedImage.url;

        const [result] = await db.execute(
            "UPDATE ProductImages SET image_url = ? WHERE productImageID = ?",
            [newImageUrl, productImageID]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Image not found or already deleted" });
        }

        res.status(200).json({
            message: "Image updated successfully",
            productImageID,
            image_url: newImageUrl
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const productVariantImages = async (req, res) => {
    const files = req.files;
    const variantID = req.params.variantID;

    try {
        let imageUrls = [];

        if (files && files.length > 0) {
            const uploadPromises = files.map(file => uploadOnCloudinary(file.path));
            const uploadResults = await Promise.all(uploadPromises);
            imageUrls = uploadResults.map(result => result.url);
        }

        const insertPromises = imageUrls.map(async (url) => {
            const [result] = await db.execute(
                "INSERT INTO ProductImages (variantID, image_url) VALUES (?, ?)",
                [variantID, url]
            );

            return {
                productImageID: result.insertId,
                image_url: url
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


export
{
 createProduct,
 updateProduct,
 reviewProduct,
 editReview,
 getProductById,
 getAllProducts,
 deleteProduct,
 createVariant,
 updateVariant,
 getVariantsByProduct,
 getVariantById,
 productVariantImages,
 updateSecondaryImage,
 deleteVariant

}