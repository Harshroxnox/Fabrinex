import { db } from '../index.js';
import { constants } from '../config/constants.js';
import { uploadOnCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';
import { generateUniqueBarcode } from '../utils/generateBarcode.js';

// product controller 

export const createProduct = async (req, res) => {
  const { name, description, category } = req.body;

  // check if category is valid
  if (!constants.PRODUCT_CATEGORIES.includes(category)) {
    return res.status(400).json({
      error: `Invalid category. Must be one of: ${constants.PRODUCT_CATEGORIES.join(', ')}`
    });
  }
  // check if description is valid JSON object
  if (!(typeof description === 'object' && description !== null && !Array.isArray(description))) {
    return res.status(400).json({
      error: "Description must be a valid JSON Object"
    });
  }

  try {
    const [result] = await db.execute(
      "INSERT INTO Products (name, description, category) VALUES (?, ?, ?)",
      [name, description, category]
    );
    res.status(201).json({ message: "Product created", productID: result.insertId });

  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const updateProduct = async (req, res) => {
  const { name, description, category } = req.body;

  // check if category is valid
  if (!constants.PRODUCT_CATEGORIES.includes(category)) {
    return res.status(400).json({
      error: `Invalid category. Must be one of: ${constants.PRODUCT_CATEGORIES.join(', ')}`
    });
  }
  // check if description is valid JSON object
  if (!(typeof description === 'object' && description !== null && !Array.isArray(description))) {
    return res.status(400).json({
      error: "Description must be a valid JSON Object"
    });
  }

  try {
    const [result] = await db.execute(
      "UPDATE Products SET name=?, description=?, category=? WHERE productID=?",
      [name, description, category, req.params.productID]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: "Product not found" });
    res.status(200).json({ message: "Product updated" });

  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const getProductById = async (req, res) => {
  const productID = req.params.productID;

  try {
    const [products] = await db.execute(`
      SELECT 
        name,
        description,
        category,
        people_rated, 
        (cumulative_rating / NULLIF(people_rated, 0)) AS average_rating 
      FROM 
        Products 
      WHERE 
        productID = ?
    `, [productID]);

    // return if product not found
    if (products.length === 0) return res.status(404).json({ error: "Product not found" });

    const product = products[0];

    // Attach variants of the product
    const [variants] = await db.execute(
      "SELECT variantID, color, size, price, main_image, discount FROM ProductVariants WHERE productID = ?",
      [productID]
    );

    product.variants = variants;
    res.status(200).json({
      message: "Fetched product successfully",
      product 
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const getAllProducts = async (req, res) => {
  try {
    const [products] = await db.execute(`
      SELECT 
        p.*, 
        pv.main_image, 
        pv.price, 
        pv.discount
      FROM 
        Products p
      JOIN 
        ProductVariants pv 
        ON pv.variantID = (
          SELECT variantID FROM ProductVariants 
          WHERE productID = p.productID
          ORDER BY variantID ASC LIMIT 1
        )
    `);
    res.status(200).json({
      message: "All products fetched successfully", 
      products 
    });
  } catch (error) {
    console.error('Error fetching all products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const deleteProduct = async (req, res) => {
  try {
    const [result] = await db.execute("DELETE FROM Products WHERE productID=?", [req.params.productID]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Product not found" });
    res.status(200).json({ message: "Product deleted" });

  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const reviewProduct = async (req, res) => {
  const { rating, review } = req.body;
  const userID = req.userID;
  const productID = req.params.productID;
  let conn;
  let parsedRating = parseFloat(rating);

  // Validate rating (must be a number between 1 and 5 with up to 2 decimal places)
  if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    return res.status(400).json({ error: "Rating must be a number between 1 and 5" });
  }

  try {
    // Make connection for transaction
    conn = await db.getConnection();
    await conn.beginTransaction();

    //  Check if user has purchased any variant of the product
    const [rows] = await conn.execute(`
      SELECT COUNT(*) AS bought
      FROM Orders o
      JOIN OrderItems oi ON o.orderID = oi.orderID
      JOIN ProductVariants pv ON oi.variantID = pv.variantID
      WHERE o.userID = ?
      AND pv.productID = ?
    `, [userID, productID]);

    if (rows[0].bought == 0) {
      await conn.rollback();
      return res.status(403).json({ error: "You can only review products you have purchased" });
    }

    // Check if the user has already reviewed this product for this order
    const [existingReview] = await conn.execute(
      "SELECT reviewID FROM Reviews WHERE userID = ? AND productID = ?",
      [userID, productID]
    );

    if (existingReview.length > 0) {
      await conn.rollback();
      return res.status(400).json({
        error: "You have already reviewed this product. Go to edit review if you want to change review."
      });
    }

    // Insert the new review
    await conn.execute(
      "INSERT INTO Reviews (userID, productID, rating, review) VALUES (?, ?, ?, ?)",
      [userID, productID, parsedRating, review || null] // Allow null for review text
    );

    // Update cumulative rating and people rated in Products table
    await conn.execute(
      "UPDATE Products SET cumulative_rating = cumulative_rating + ?, people_rated = people_rated + 1 WHERE productID = ?",
      [parsedRating, productID]
    );

    await conn.commit();
    res.status(201).json({ message: "Review submitted successfully" });

  } catch (error) {
    // rollback database changes
    if (conn) await conn.rollback();
    console.error('Error reviewing product:', error);
    res.status(500).json({ error: 'Internal server error' });

  } finally {
    if (conn) conn.release(); // release connection
  }
};


export const updateReview = async (req, res) => {
  // rating is required; review is optional (only updated if non-empty)
  const { rating, review } = req.body;
  const userID = req.userID;
  const productID = req.params.productID;
  let conn;
  let parsedRating = parseFloat(rating);

  // Validate rating (must be a number between 1 and 5 with up to 2 decimal places)
  if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    return res.status(400).json({ error: "Rating must be a number between 1 and 5" });
  }

  try {
    // Make connection for transaction
    conn = await db.getConnection();
    await conn.beginTransaction();

    // Check if the user has already reviewed this product
    const [existingReview] = await conn.execute(
      "SELECT * FROM Reviews WHERE userID = ? AND productID = ?",
      [userID, productID]
    );

    if (existingReview.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "No review found for this product." });
    }

    // Get old rating to adjust cumulative rating in Products table
    const oldRating = existingReview[0].rating;
    const updatedReview = (typeof review === "string" && review.trim() !== "")
      ? review.trim()
      : existingReview[0].review;

    // Update review and rating
    await conn.execute(
      "UPDATE Reviews SET rating = ?, review = ? WHERE userID = ? AND productID = ?",
      [parsedRating, updatedReview, userID, productID]
    );

    //  Update cumulative rating in Products table        
    const ratingDifference = parsedRating - oldRating;
    await conn.execute(
      "UPDATE Products SET cumulative_rating = cumulative_rating + ? WHERE productID = ?",
      [ratingDifference, productID]
    );

    await conn.commit();
    res.status(200).json({ message: "Review updated successfully" });

  } catch (error) {
    // rollback database changes
    if (conn) await conn.rollback();
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Internal server error' });

  } finally {
    if (conn) conn.release(); // release connection
  }
};


export const deleteReview = async (req, res) => {
  const userID = req.userID;
  const productID = req.params.productID;
  let conn;

  try {
    // Make connection for transaction
    conn = await db.getConnection();
    await conn.beginTransaction();

    // Check if the user has reviewed this product
    const [existingReview] = await conn.execute(
      "SELECT * FROM Reviews WHERE userID = ? AND productID = ?",
      [userID, productID]
    );

    if (existingReview.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "No review found for this product." });
    }

    // Get old rating to adjust cumulative rating in Products table
    const ratingToSubtract = existingReview[0].rating;

    // Delete the review and update cumulative stats
    await conn.execute(
      "DELETE FROM Reviews WHERE userID = ? AND productID = ?",
      [userID, productID]
    );
    await conn.execute(
      `UPDATE Products SET cumulative_rating = cumulative_rating - ?, people_rated = people_rated - 1 WHERE productID = ?`,
      [ratingToSubtract, productID]
    );

    await conn.commit();
    res.status(200).json({ message: "Review deleted successfully." });

  } catch (error) {
    // rollback database changes
    if (conn) await conn.rollback();
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Internal server error' });

  } finally {
    if (conn) conn.release(); // release connection
  }
};

// Variant Controller 

export const createVariant = async (req, res) => {
  const productID = req.params.productID;
  const { color, size, price, discount, stock } = req.body;
  const mainImgPath = req.file ? req.file.path : null;

  // Validate color and size (non-empty, non-whitespace string)
  if (typeof color !== "string" || color.trim() === "") {
    return res.status(400).json({ error: "Color must be a non-empty string." });
  }

  if (typeof size !== "string" || size.trim() === "") {
    return res.status(400).json({ error: "Size must be a non-empty string." });
  }

  // Validate price and discount as numbers (decimal allowed)
  const parsedPrice = parseFloat(price);
  const parsedDiscount = parseFloat(discount);

  if (isNaN(parsedPrice) || parsedPrice < 0) {
    return res.status(400).json({ error: "Price must be a non-negative number." });
  }

  if (isNaN(parsedDiscount) || parsedDiscount < 0 || parsedDiscount > 100) {
    return res.status(400).json({ error: "Discount must be a number between 0 and 100." });
  }

  // Validate stock as an integer >= 0
  const parsedStock = Number(stock);
  if (!Number.isInteger(parsedStock) || parsedStock < 0) {
    return res.status(400).json({ error: "Stock must be a non-negative integer." });
  }

  if (!mainImgPath) {
    return res.status(400).json({ error: "Main image not provided!" });
  }

  try {
    const mainImgCloudinary = await uploadOnCloudinary(mainImgPath);
    const barcode = await generateUniqueBarcode();

    const [result] = await db.execute(
      "INSERT INTO ProductVariants (productID, color, size, price, discount, stock, main_image, cloudinary_id, barcode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [productID, color.trim(), size.trim(), parsedPrice, parsedDiscount, parsedStock, mainImgCloudinary.url, mainImgCloudinary.public_id, barcode]
    );
    res.status(201).json({ message: "Variant created", variantID: result.insertId });
  } catch (error) {
    console.error('Error creating variant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const updateVariant = async (req, res) => {
  const { price, discount, stock } = req.body;
  const mainImgPath = req.file ? req.file.path : null;
  const variantID = req.params.variantID;
  const fields = {};
  let cloudinaryID; // this is to be deleted later

  // Validate price, discount and stock if they are given and add to fields
  let parsedPrice;
  let parsedDiscount;
  let parsedStock;

  if (price != null){
    parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ error: "Price must be a non-negative number." });
    }
    fields.price = parsedPrice;
  }

  if (discount != null){
    parsedDiscount = parseFloat(discount)
    if (isNaN(parsedDiscount) || parsedDiscount < 0 || parsedDiscount > 100) {
      return res.status(400).json({ error: "Discount must be a number between 0 and 100." });
    }
    fields.discount = parsedDiscount;
  }

  if (stock != null){
    parsedStock = Number(stock);
    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
      return res.status(400).json({ error: "Stock must be a non-negative integer." });
    }
    fields.stock = parsedStock;
  }

  try {
    const [variants] = await db.execute(
      `SELECT cloudinary_id FROM ProductVariants WHERE variantID = ?`,
      [variantID]
    );

    // If variant not found return 
    if (variants.length === 0) {
      return res.status(404).json({ error: 'Variant not found' });
    }
    
    // If image is provided, upload to Cloudinary
    if (mainImgPath) {
      cloudinaryID = variants[0].cloudinary_id;

      // Upload this image to Cloudinary
      const uploadedImage = await uploadOnCloudinary(mainImgPath);
      if (uploadedImage && uploadedImage.url) {
        fields.main_image = uploadedImage.url;
        fields.cloudinary_id = uploadedImage.public_id;
      }
    }

    const keys = Object.keys(fields);
    if (keys.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    // Construct the SET clause dynamically
    const setClause = keys.map(key => `${key} = ?`).join(', ');
    const values = keys.map(key => fields[key]);

    // Add variantID for the WHERE clause
    values.push(variantID);

    const [result] = await db.execute(
      `UPDATE ProductVariants SET ${setClause} WHERE variantID = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Variant not found" });
    }

    // Delete previous image from Cloudinary
    if (cloudinaryID){
      await deleteFromCloudinary(cloudinaryID);
    }

    res.status(200).json({ message: "Variant updated successfully", updatedFields: fields  });

  } catch (error) {
    console.error('Error updating variant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const getVariantsByProduct = async (req, res) => {
  const productID = req.params.productID;
  try {
    const [variants] = await db.execute("SELECT * FROM ProductVariants WHERE productID = ?", [productID]);
    res.status(200).json({
      message: "Fetched all variants of given product successfully", 
      variants 
    });
  } catch (error) {
    console.error('Error fetching variants of product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const getAllVariants = async (req, res) => {
  try {
    const [variants] = await db.execute(`
      SELECT pv.*, p.name AS product_name, p.category
      FROM ProductVariants pv
      JOIN Products p ON pv.productID = p.productID
    `);
    res.status(200).json({ 
      message: "Fetched all variants successfully",
      variants 
    });
  } catch (error) {
    console.error('Error fetching all variants:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const getVariantById = async (req, res) => {
  const variantID = req.params.variantID;

  try {
    // Get variant + product info
    const [variants] = await db.execute(`
      SELECT 
        pv.*, 
        p.name AS product_name, 
        p.category
      FROM ProductVariants pv
      JOIN Products p ON pv.productID = p.productID
      WHERE pv.variantID = ?
    `, [variantID]);

    // Return if variant not found
    if (variants.length === 0) {
      return res.status(404).json({ error: "Variant not found." });
    }
    const variant = variants[0];

    // Get secondary images for this variant
    const [images] = await db.execute(
      `SELECT variantImageID, image_url, cloudinary_id FROM VariantImages WHERE variantID = ?`,
      [variantID]
    );
    variant.secondary_images = images;

    res.status(200).json({
      message: "Fetched variant successfully", 
      variant 
    });

  } catch (error) {
    console.error('Error fetching variant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const deleteVariant = async (req, res) => {
  const variantID = req.params.variantID;
  try {
    const [variants] = await db.execute(
      `SELECT cloudinary_id FROM ProductVariants WHERE variantID = ?`,
      [variantID]
    );

    // If variant not found return 
    if (variants.length === 0) {
      return res.status(404).json({ error: 'Variant not found' });
    }

    // Extracting secondary images cloudinaryIDs
    const [secondaryImgs] = await db.execute(
      `SELECT cloudinary_id FROM VariantImages WHERE variantID = ?`,
      [variantID]
    );

    let cloudinaryID = variants[0].cloudinary_id;

    await db.execute("DELETE FROM ProductVariants WHERE variantID=?", [variantID]);
    // Early response before deleting cloudinary images so that the client does not
    // need to wait for the deletion of all cloudinary images and any error in those does
    // not affect response
    res.status(200).json({ message: "Variant deleted successfully" });

    // Delete main image and secondary images from Cloudinary
    // Fire and forget, non blocking, does not affect response, does not use await
    deleteFromCloudinary(cloudinaryID);
    secondaryImgs.forEach((image)=> deleteFromCloudinary(image.cloudinary_id));
    
  } catch (error) {
    console.error('Error deleting variant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// TODO: Probably need to wrap this in transaction and do cloudinary non-blocking fire and forget cleanup
// we should avoid promise.all here in any case I think
// cloud storage wasted and database inconsistencies in this function
export const uploadSecondaryImages = async (req, res) => {
  const files = req.files;
  const variantID = req.params.variantID;

  // check if files are provided
  if (!files || files.length === 0) {
    return res.status(400).json({ error: "No files were provided." });
  }

  // TODO: check if variant exists

  try {
    let uploadResults = [];

    // Upload the images on cloudinary and get the url
    // NOTE: promise.all only resolves when all uploads are successfull otherwise we go into catch
    if (files && files.length > 0) {
      const uploadPromises = files.map(file => uploadOnCloudinary(file.path));
      uploadResults = await Promise.all(uploadPromises);
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

  } catch (error) {
    console.error('Error uploading secondary images:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const deleteSecondaryImage = async (req, res) => {
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

    // Delete from DB
    await db.execute(
      "DELETE FROM VariantImages WHERE variantImageID = ?",
      [variantImageID]
    );

    // Delete from Cloudinary
    await deleteFromCloudinary(cloudinaryID);

    res.status(200).json({ message: "Secondary Image deleted successfully." });

  } catch (error) {
    console.error('Error deleting secondary image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

