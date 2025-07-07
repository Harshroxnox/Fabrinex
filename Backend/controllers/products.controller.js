import { db } from '../index.js';
import { constants } from '../config/constants.js';
import { uploadOnCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';
import { generateUniqueBarcode } from '../utils/generateBarcode.js';
import { validID, validStringChar, validString, validDecimal, validWholeNo, validStringNum } from '../utils/validators.utils.js';
import {deleteTempImg} from '../utils/deleteTempImg.js';

// product controller 

export const createProduct = async (req, res) => {

  const name = validStringChar(req.body.name, 3, 100);
  const { description, category } = req.body;

  if(name===null){
    return res.status(400).json({error :" Name must be a valid string between 3 to 100 chars"})
  }

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

  const name = validStringChar(req.body.name, 3, 100);
  const productID=validID(req.params.productID);
  const { description, category } = req.body;

  if (productID === null) {
    return res.status(400).json({ error: "Invalid productID" });
  }

  if(name===null){
    return res.status(400).json({error :" Name must be a valid string between 3 to 100 chars"})
  }

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
      [name, description, category,productID ]
    );
    if (result.affectedRows=== 0) return res.status(404).json({ error: "Product not found" });
    res.status(200).json({ message: "Product updated", productID:result.productID });

  } catch (error) {
    console.error('Error updating product:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const getProductById = async (req, res) => {

  const productID = validID(req.params.productID);

  if (productID === null) {
    return res.status(400).json({ error: "Invalid productID" });
  }

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

// To DISCUSS: I (Ak) think that product variant will get deleted from table but we will need to have deletion of cloudinary images of variants ? 
export const deleteProduct = async (req, res) => {
  const productID = validID(req.params.productID);

  if (productID === null) {
    return res.status(400).json({ error: "Invalid productID" })
  }

  try {
    const [result] = await db.execute("DELETE FROM Products WHERE productID=?", [productID]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Product not found" });
    res.status(200).json({ message: "Product deleted" });

  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const reviewProduct = async (req, res) => {

  const rating = validDecimal(req.body.rating);
  const productID = validID(req.params.productID);
  const review = req.body.review;
  const userID = req.userID;
  let conn;

  if (productID === null) {
    return res.status(400).json({ error: "Invalid productID" });
  }

  // Validate rating (must be a number between 1 and 5 with up to 2 decimal places)
  if (rating === null || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be a number between 1 and 5" });
  }

  let validReview;
  if (review) {
    validReview = validString(req.body.review, 0, 750);

    if (validReview === null) {
      return res.status(400).json({ error: "Review must be a valid string" });
    }
  }
  else {
    validReview = review;
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
      [userID, productID, rating, validReview || null] // Allow null for review text
    );

    // Update cumulative rating and people rated in Products table
    await conn.execute(
      "UPDATE Products SET cumulative_rating = cumulative_rating + ?, people_rated = people_rated + 1 WHERE productID = ?",
      [rating, productID]
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

  const rating = validDecimal(req.body.rating);
  const productID = validID(req.params.productID);
  const review = req.body.review;
  const userID = req.userID;
  let conn;

  if (productID === null) {
    return res.status(400).json({ error: "Invalid productID" });
  }

  // Validate rating (must be a number between 1 and 5 with up to 2 decimal places)
  if (rating === null || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be a number between 1 and 5" });
  }

  let validReview;
  if (review) {
    validReview = validString(req.body.review, 0, 750);

    if (validReview === null) {
      return res.status(400).json({ error: "Review must be a valid string" });
    }
  }
  else {
    validReview = review;
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
    const updatedReview = (validReview != null)
      ? validReview
      : existingReview[0].review;

    // Update review and rating
    await conn.execute(
      "UPDATE Reviews SET rating = ?, review = ? WHERE userID = ? AND productID = ?",
      [rating, updatedReview, userID, productID]
    );

    //  Update cumulative rating in Products table        
    const ratingDifference = rating - oldRating;
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
  const productID = validID(req.params.productID);
  let conn;

  if (productID === null) {
    return res.status(400).json({ error: "Invalid productID" });
  }

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
  const productID = validID(req.params.productID);
  const color = validStringChar(req.body.color, 3, 50);
  const size = validString(req.body.size, 1, 20);
  const price = validDecimal(req.body.price);
  const discount = validDecimal(req.body.discount);
  const stock = validWholeNo(req.body.stock);
  const mainImgPath = req.file ? req.file.path : null;
  let cloudinaryID;

  try {
    // VALIDATIONS 
    if (productID === null) {
      return res.status(400).json({ error: "Invalid productID" });
    }

    if (color === null) {
      return res.status(400).json({ error: "Invalid color" });
    }

    if (size === null) {
      return res.status(400).json({ error: "Invalid size" });
    }

    // validDecimal allows negative values. We need to check for price <= 0
    if (price === null || price <= 0) {
      return res.status(400).json({ error: "Invalid price" });
    }

    if (discount === null || discount < 0 || discount > 100) {
      return res.status(400).json({ error: "Invalid discount must be between 0 and 100" });
    }

    //Is it ok to reuse validID for integer check ?  can use isInteger()
    //No because validID doesn't allow 0 but stock can be 0. I have made a seperate func for this
    if (stock === null) {
      return res.status(400).json({ error: "Invalid stock" });
    }

    if (!mainImgPath) {
      return res.status(400).json({ error: "Main image not provided" });
    }

    // UPLOAD IMAGE 
    const mainImgCloudinary = await uploadOnCloudinary(mainImgPath);
    cloudinaryID = mainImgCloudinary.public_id;

    const barcode = await generateUniqueBarcode();

    const [result] = await db.execute(
      `INSERT INTO ProductVariants 
       (productID, color, size, price, discount, stock, main_image, cloudinary_id, barcode) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        productID,
        color,
        size,
        price,
        discount,
        stock,
        mainImgCloudinary.url,
        cloudinaryID,
        barcode
      ]
    );

    return res.status(201).json({
      message: "Variant created",
      variantID: result.insertId,
    });

  } catch (error) {
    console.error("Error creating variant:", error);
    res.status(500).json({ error: "Internal server error" });

    // Clean cloudinary image if needed
    if (cloudinaryID) {
      deleteFromCloudinary(cloudinaryID).catch((error) => {
        console.warn(`Cloudinary deletion failed. CloudinaryID:${cloudinaryID} ${error.message}`);
      });
    }

  } finally {
    //Deleting temp image if needed
    if (mainImgPath) {
      // I don't think we need await here
      deleteTempImg(mainImgPath).catch((error) => {
        console.warn(`Failed to delete file ${mainImgPath}: ${error.message}`);
      });
    }
  }
};


export const updateVariant = async (req, res) => {

  const variantID = validID(req.params.variantID);
  const price = validDecimal(req.body.price);
  const discount = validDecimal(req.body.discount);
  const stock = validWholeNo(req.body.stock);
  const mainImgPath = req.file ? req.file.path : null;
  let cloudinaryID;
  const fields = {};

  try {

    if (variantID === null) {
      return res.status(400).json({ error: "Invalid variantID" });
    }

    // Validate price, discount and stock 

    // validDecimal allows negative values. We need to check for price <= 0
    if (price === null || price <= 0) {
      return res.status(400).json({ error: "Invalid price" });
    }

    if (discount === null || discount < 0 || discount > 100) {
      return res.status(400).json({ error: "Invalid discount must be between 0 and 100" });
    }

    if (stock === null) {
      return res.status(400).json({ error: "Invalid stock" });
    }

    fields.price = price;
    fields.stock = stock;
    fields.discount = discount;

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
      fields.main_image = uploadedImage.url;
      fields.cloudinary_id = uploadedImage.public_id;
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

    await db.execute(
      `UPDATE ProductVariants SET ${setClause} WHERE variantID = ?`,
      values
    );

    res.status(200).json({ message: "Variant updated successfully", updatedFields: fields });

    // Delete previous image from Cloudinary
    if (cloudinaryID) {
      deleteFromCloudinary(cloudinaryID).catch((error) => {
        console.warn(`Cloudinary deletion failed. ${error.message} CloudinaryID:${cloudinaryID}`);
      });
    }

  } catch (error) {
    console.error('Error updating variant:', error);
    res.status(500).json({ error: 'Internal server error' });

    // Cleanup new uploaded image if need be
    if (fields.cloudinary_id) {
      deleteFromCloudinary(fields.cloudinary_id).catch((error) => {
        console.error("Error deleting from cloudinary:", error);
        console.warn("Cloudinary deletion failed. CloudinaryID:", fields.cloudinary_id);
      });
    }
  } finally {
    //Deleting temp image if needed
    if (mainImgPath) {
      deleteTempImg(mainImgPath).catch((error) => {
        console.warn(`Failed to delete file ${mainImgPath}: ${error.message}`);
      });
    }
  }
};


export const getVariantsByProduct = async (req, res) => {
  const productID = validID(req.params.productID);

  if (productID === null) {
    return res.status(400).json({ error: "Invalid productID" });
  }

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
  const variantID = validID(req.params.variantID);

  if (variantID === null) {
    return res.status(400).json({ error: "Invalid variantID" });
  }

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
  const variantID = validID(req.params.variantID);

  if (variantID === null) {
    return res.status(400).json({ error: "Invalid variantID" });
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
    deleteFromCloudinary(cloudinaryID).catch((error) => {
      console.error("Error deleting from cloudinary:", error);
      console.warn("Cloudinary deletion failed. CloudinaryID:", cloudinaryID);
    });
    secondaryImgs.forEach((image) => {
      deleteFromCloudinary(image.cloudinary_id).catch((error) => {
        console.error("Error deleting from cloudinary:", error);
        console.warn("Cloudinary deletion failed. CloudinaryID:", image.cloudinary_id);
      });
    });

  } catch (error) {
    console.error('Error deleting variant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const uploadSecondaryImages = async (req, res) => {
  const files = req.files;
  const variantID = validID(req.params.variantID);
  let conn;

  try {

    if (variantID === null) {
      return res.status(400).json({ error: "Invalid variantID" });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files were provided." });
    }

    // Check if variant exists
    const [variants] = await db.execute(
      `SELECT cloudinary_id FROM ProductVariants WHERE variantID = ?`,
      [variantID]
    );

    if (variants.length === 0) {
      return res.status(404).json({ error: 'Variant not found' });
    }

    // To store public_id for possible rollback
    const uploadedImages = [];

    conn = await db.getConnection();
    await conn.beginTransaction();

    const insertedImages = [];

    for (const file of files) {
      const result = await uploadOnCloudinary(file.path);

      // Save public_id for rollback if needed
      uploadedImages.push(result.public_id);

      const [output] = await conn.execute(
        "INSERT INTO VariantImages (variantID, image_url, cloudinary_id) VALUES (?, ?, ?)",
        [variantID, result.url, result.public_id]
      );

      insertedImages.push({
        variantImageID: output.insertId,
        image_url: result.url
      });
    }

    await conn.commit();

    res.status(200).json({
      message: "Secondary images uploaded successfully",
      images: insertedImages
    });
  }
  catch (error) {
    if (conn) await conn.rollback();

    console.error('Error uploading secondary images:', error);
    res.status(500).json({ error: 'Internal server error' });

    // Fire-and-forget Cloudinary cleanup
    uploadedImages.forEach(public_id => {
      deleteFromCloudinary(public_id).catch(error => {
        console.error("Error deleting from cloudinary:", error);
        console.warn("Cloudinary deletion failed. CloudinaryID:", public_id);
      });
    });

  } finally {
    if (conn) conn.release();

    for (const file of files) {
      deleteTempImg(file.path).catch((error) => {
        console.warn(`Failed to delete file ${file.path}: ${error.message}`);
      })
    }
  }
};


export const deleteSecondaryImage = async (req, res) => {
  const variantImageID = validID(req.params.variantImageID);

  if (variantImageID === null) {
    return res.status(400).json({ error: "Invalid variantImageID" });
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

    res.status(200).json({ message: "Secondary Image deleted successfully." });

    // Fire-and-forget Cloudinary cleanup
    deleteFromCloudinary(cloudinaryID).catch(error => {
      console.error("Error deleting from cloudinary:", error);
      console.warn("Cloudinary deletion failed. CloudinaryID:", cloudinaryID);
    });

  } catch (error) {
    console.error('Error deleting secondary image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
