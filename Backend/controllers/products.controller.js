import { db } from '../index.js';
import { constants } from '../config/constants.js';
import { uploadOnCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';
import { generateUniqueBarcode } from '../utils/generateBarcode.js';
import { validID, validStringChar, validString, validDecimal, validWholeNo, validReview } from '../utils/validators.utils.js';
import { deleteTempImg } from '../utils/deleteTempImg.js';
import logger from '../utils/logger.js';
import AppError from '../errors/appError.js';

// product controller 

export const createProduct = async (req, res, next) => {
  const name = validString(req.body.name, 3, 100);
  const { description, category } = req.body;

  try {
    // check if name is valid
    if(name === null){
      throw new AppError(400, "Name must be a valid string between 3 to 100 chars");
    }

    // check if category is valid
    if (!constants.PRODUCT_CATEGORIES.includes(category)) {
      throw new AppError(
        400,
        `Invalid category. Must be one of: ${constants.PRODUCT_CATEGORIES.join(', ')}` 
      );
    }

    // check if description is valid JSON object
    if (!(typeof description === 'object' && description !== null && !Array.isArray(description))) {
      throw new AppError(400, "Description must be a valid JSON Object");
    }

    const [result] = await db.execute(
      "INSERT INTO Products (name, description, category) VALUES (?, ?, ?)",
      [name, description, category]
    );
    res.status(201).json({ message: "Product created", productID: result.insertId });

  } catch (error) {
    next(error);
  }
};


export const updateProduct = async (req, res, next) => {
  const productID = validID(req.params.productID);
  const rawName = req.body.name
  const { description, category } = req.body;
  const fields = {};

  try {
    // check if productID is valid
    if (productID === null) {
      throw new AppError(400, "Invalid productID");
    }

    // If name exists check if it is valid
    if(rawName){
      const name = validString(rawName, 3, 100);
      if(name === null){
        throw new AppError(400, "Name must be a valid string between 3 to 100 chars");
      }
      fields.name = name;
    }

    // If category exists check if it is valid
    if(category){
      if (!constants.PRODUCT_CATEGORIES.includes(category)) {
        throw new AppError(
          400,
          `Invalid category. Must be one of: ${constants.PRODUCT_CATEGORIES.join(', ')}` 
        );
      }
      fields.category = category;
    }

    // If description exists check if it is valid
    if(description){
      if (!(typeof description === 'object' && description !== null && !Array.isArray(description))) {
        throw new AppError(400, "Description must be a valid JSON Object");
      }
      fields.description = description;
    }

    // If nothing to update return
    if (Object.keys(fields).length === 0) {
      throw new AppError(400, "No valid fields provided for update");
    }
 
    // Construct update
    const setClause = Object.keys(fields).map(key => `${key} = ?`).join(', ');
    const values = Object.values(fields);
    values.push(productID);

    // Update product
    const [result] = await db.execute(
      `UPDATE Products SET ${setClause} WHERE productID = ? AND is_active = TRUE`,
      values
    );
    if (result.affectedRows === 0) throw new AppError(404, "Product not found");
    res.status(200).json({ message: "Product updated", productID });

  } catch (error) {
    error.context = { productID };
    next(error);
  }
};


export const getProductById = async (req, res, next) => {
  const productID = validID(req.params.productID);
  
  try {
    if (productID === null) {
      throw new AppError(400, "Invalid productID");
    }
  
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
        productID = ? AND is_active = TRUE
    `, [productID]);

    // return if product not found
    if (products.length === 0) throw new AppError(404, "Product not found");

    const product = products[0];

    // Attach active variants of the product
    const [variants] = await db.execute(`
      SELECT variantID, color, size, price, main_image, discount 
      FROM ProductVariants 
      WHERE productID = ? AND is_active = TRUE
    `,[productID]);

    if (variants.length === 0){
      throw new AppError(400, "Product has no variants");
    }

    product.variants = variants;
    res.status(200).json({
      message: "Fetched product successfully",
      product
    });

  } catch (error) {
    error.context = { productID };
    next(error);
  }
};


export const getAllProducts = async (req, res, next) => {
  const limit = validID(req.query.limit);
  const page = validID(req.query.page);

  try {
    if (limit === null || limit > constants.MAX_LIMIT){
      throw new AppError(400, `Limit must be a valid number below ${constants.MAX_LIMIT}`);
    }

    if(page === null){
      throw new AppError(400, "Page must be a valid number");
    }

    const offset = (page - 1) * limit;
    const [products] = await db.execute(`
      SELECT 
        p.productID, 
        p.name,
        p.description,
        p.category,
        p.people_rated,
        (p.cumulative_rating / NULLIF(p.people_rated, 0)) AS average_rating,
        pv.main_image, 
        pv.price, 
        pv.discount
      FROM 
        Products p
      JOIN 
        ProductVariants pv 
        ON pv.variantID = (
          SELECT variantID FROM ProductVariants 
          WHERE productID = p.productID AND is_active = TRUE
          ORDER BY variantID ASC LIMIT 1
        )
      WHERE p.is_active = TRUE
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [`${limit}`, `${offset}`]);

    // Get the count of total no of products
    const [count] = await db.execute(`
      SELECT COUNT(*) AS count
      FROM Products p
      JOIN ProductVariants pv ON pv.variantID = (
        SELECT variantID FROM ProductVariants 
        WHERE productID = p.productID AND is_active = TRUE
        LIMIT 1
      )
      WHERE p.is_active = TRUE
    `);

    res.status(200).json({
      message: "All products fetched successfully",
      total: count[0].count,
      products
    });
  } catch (error) {
    next(error);
  }
};


export const deleteProduct = async (req, res, next) => {
  const productID = validID(req.params.productID);
  let conn;

  try {
    if (productID === null) {
      throw new AppError(400, "Invalid productID");
    }

    conn = await db.getConnection();
    await conn.beginTransaction();
    
    // Delete the product i.e set inactive
    const [result] = await conn.execute("UPDATE Products SET is_active = FALSE WHERE productID = ? AND is_active = TRUE", [productID]);
    if (result.affectedRows === 0){
      throw new AppError(404, "Product not found");
    } 

    // Fetch the cloudinary_id of secondary imgs of all active variants of given product
    const [secondaryImgs] = await conn.execute(`
      SELECT
        vi.cloudinary_id
      FROM
        VariantImages vi
      JOIN
        ProductVariants pv
      ON pv.variantID = vi.variantID
      WHERE pv.productID = ? AND pv.is_active = TRUE
    `, [productID]);

    // Delete the secondary images of all active variants of given product
    await conn.execute(`
      DELETE vi FROM VariantImages vi
      JOIN ProductVariants pv ON pv.variantID = vi.variantID
      WHERE pv.productID = ? AND pv.is_active = TRUE
    `, [productID]);

    // Delete all the active variants i.e set inactive
    await conn.execute("UPDATE ProductVariants SET is_active = FALSE WHERE productID = ? AND is_active = TRUE", [productID]);

    await conn.commit();
    res.status(200).json({ message: "Product deleted" });
    
    // Fire and forget for deleting cloudinary images
    secondaryImgs.forEach((secondaryImg)=>{
      let cloudinaryID = secondaryImg.cloudinary_id;
      deleteFromCloudinary(cloudinaryID).catch((error) => {
        logger.warn(`Cloudinary deletion failed. CloudinaryID:${cloudinaryID} ${error.message}`);
      });
    })

  } catch (error) {
    if (conn) await conn.rollback();
    error.context = { productID };
    next(error);

  } finally {
    if (conn) conn.release();
  }
};


export const reviewProduct = async (req, res, next) => {
  const rating = validDecimal(req.body.rating);
  const productID = validID(req.params.productID);
  const rawReview = req.body.review; // review may be null also
  const userID = req.userID;
  let conn;

  try {
    if (productID === null) {
      throw new AppError(400, "Invalid productID");
    }

    // Validate rating (must be a number between 1 and 5 with up to 2 decimal places)
    if (rating === null || rating < 1 || rating > 5) {
      throw new AppError(400, "Rating must be a number between 1 and 5");
    }

    // If review exists check if valid
    let review = null;
    if (rawReview) {
      review = validReview(rawReview, 4, 750);
      if (review === null) {
        throw new AppError(400, "Review must be a valid string between 4 and 750 chars" );
      }
    }

    // Check if product is active and has at least one active variant
    const [validProduct] = await db.execute(`
      SELECT 1
      FROM Products p
      WHERE p.productID = ?
        AND p.is_active = TRUE
        AND EXISTS (
          SELECT 1 FROM ProductVariants pv
          WHERE pv.productID = p.productID
            AND pv.is_active = TRUE
        )
      LIMIT 1
    `, [productID]);

    if (validProduct.length === 0){
      throw new AppError(400, "Product is not active or has no active variants");
    }

    // Check if user has purchased any variant of the product in the past
    const [rows] = await db.execute(`
      SELECT 1
      FROM Orders o
      JOIN OrderItems oi ON o.orderID = oi.orderID
      JOIN ProductVariants pv ON oi.variantID = pv.variantID
      WHERE o.userID = ? AND pv.productID = ?
      LIMIT 1
    `, [userID, productID]);

    if (rows.length === 0) {
      throw new AppError(
        403, 
        "You can only review for products you purchased and are still active." 
      );
    }

    // Check if the user has already reviewed this product for this order
    const [existingReview] = await db.execute(
      "SELECT reviewID FROM Reviews WHERE userID = ? AND productID = ?",
      [userID, productID]
    );

    if (existingReview.length > 0) {
      throw new AppError(
        400, 
        "You have already reviewed this product. Go to edit review if you want to change review."
      );
    }

    // Make connection for transaction
    conn = await db.getConnection();
    await conn.beginTransaction();

    // Insert the new review
    await conn.execute(
      "INSERT INTO Reviews (userID, productID, rating, review) VALUES (?, ?, ?, ?)",
      [userID, productID, rating, review] // Allow null for review text
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
    error.context = { productID, userID };
    next(error);

  } finally {
    if (conn) conn.release(); // release connection
  }
};


export const updateReview = async (req, res, next) => {
  // rating is required; review is optional (only updated if non-empty)
  const rating = validDecimal(req.body.rating);
  const productID = validID(req.params.productID);
  const rawReview = req.body.review;
  const userID = req.userID;
  let conn;

  try {
    if (productID === null) {
      throw new AppError(400, "Invalid productID");
    }

    // Validate rating (must be a number between 1 and 5 with up to 2 decimal places)
    if (rating === null || rating < 1 || rating > 5) {
      throw new AppError(400, "Rating must be a number between 1 and 5");
    }

    // If rawReview field exists check if valid
    let review = null;
    if (rawReview) {
      review = validReview(rawReview, 4, 750);
      if (review === null) {
        throw new AppError(400, "Review must be a valid string between 4 and 750 chars");
      }
    }

    // Check if product is active and has at least one active variant
    const [validProduct] = await db.execute(`
      SELECT 1
      FROM Products p
      WHERE p.productID = ?
        AND p.is_active = TRUE
        AND EXISTS (
          SELECT 1 FROM ProductVariants pv
          WHERE pv.productID = p.productID
            AND pv.is_active = TRUE
        )
      LIMIT 1
    `, [productID]);

    if (validProduct.length === 0){
      throw new AppError(400, "Product is not active or has no active variants");
    }
    
    // Check if the user has already reviewed this product
    const [existingReview] = await db.execute(
      "SELECT * FROM Reviews WHERE userID = ? AND productID = ?",
      [userID, productID]
    );

    if (existingReview.length === 0) {
      throw new AppError(404, "No review found for this product.");
    }

    // Make connection for transaction
    conn = await db.getConnection();
    await conn.beginTransaction();

    // Get old rating to adjust cumulative rating in Products table
    const oldRating = existingReview[0].rating;
    const updatedReview = (review !== null)
      ? review
      : existingReview[0].review;

    // Update review and rating
    await conn.execute(
      "UPDATE Reviews SET rating = ?, review = ? WHERE userID = ? AND productID = ?",
      [rating, updatedReview, userID, productID]
    );

    // Update cumulative rating in Products table        
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
    error.context = { productID, userID };
    next(error);

  } finally {
    if (conn) conn.release(); // release connection
  }
};


export const deleteReview = async (req, res, next) => {
  const userID = req.userID;
  const productID = validID(req.params.productID);
  let conn;

  try {
    if (productID === null) {
      throw new AppError(400, "Invalid productID");
    }

    // Check if product is active and has at least one active variant
    const [validProduct] = await db.execute(`
      SELECT 1
      FROM Products p
      WHERE p.productID = ?
        AND p.is_active = TRUE
        AND EXISTS (
          SELECT 1 FROM ProductVariants pv
          WHERE pv.productID = p.productID
            AND pv.is_active = TRUE
        )
      LIMIT 1
    `, [productID]);

    if (validProduct.length === 0){
      throw new AppError(400, "Product is not active or has no active variants");
    }

    // Check if the user has reviewed this product
    const [existingReview] = await db.execute(
      "SELECT * FROM Reviews WHERE userID = ? AND productID = ?",
      [userID, productID]
    );

    if (existingReview.length === 0) {
      throw new AppError(404, "No review found for this product.");
    }

    // Make connection for transaction
    conn = await db.getConnection();
    await conn.beginTransaction();

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
    error.context = { productID, userID };
    next(error);

  } finally {
    if (conn) conn.release(); // release connection
  }
};

// Variant Controller 

export const createVariant = async (req, res, next) => {
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
      throw new AppError(400, "Invalid productID");
    }

    if (color === null) {
      throw new AppError(400, "Invalid color");
    }

    if (size === null) {
      throw new AppError(400, "Invalid size");
    }

    if (price === null || price <= 0) {
      throw new AppError(400, "Invalid price");
    }

    if (discount === null || discount < 0 || discount >= 100) {
      throw new AppError(400, "Invalid discount must be between 0 and 100");
    }

    if (stock === null) {
      throw new AppError(400, "Invalid stock");
    }

    if (!mainImgPath) {
      throw new AppError(400, "Main image not provided");
    }

    // Check if product is active
    const [activeProduct] = await db.execute(`
      SELECT 1 FROM Products WHERE productID = ? AND is_active = TRUE
    `, [productID]);

    if (activeProduct.length === 0){
      throw new AppError(404, "No product found");
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
    error.context = { productID };
    next(error);

    // Clean cloudinary image if needed
    if (cloudinaryID) {
      deleteFromCloudinary(cloudinaryID).catch((error) => {
        logger.warn(`Cloudinary deletion failed. CloudinaryID:${cloudinaryID} ${error.message}`);
      });
    }

  } finally {
    // Deleting temp image if needed
    if (mainImgPath) {
      deleteTempImg(mainImgPath).catch((error) => {
        logger.warn(`Failed to delete file ${mainImgPath}: ${error.message}`);
      });
    }
  }
};


export const updateVariant = async (req, res, next) => {
  const variantID = validID(req.params.variantID);
  const priceRaw = req.body.price;
  const discountRaw = req.body.discount;
  const stockRaw = req.body.stock;
  const mainImgPath = req.file ? req.file.path : null;
  const fields = {};

  try {
    if (variantID === null) {
      throw new AppError(400, "Invalid variantID");
    }

    // Process and validate only if values are provided
    if (priceRaw) {
      const price = validDecimal(priceRaw);
      if (price === null || price <= 0) {
        throw new AppError(400, "Invalid price");
      }
      fields.price = price;
    }

    if (discountRaw) {
      const discount = validDecimal(discountRaw);
      if (discount === null || discount < 0 || discount >= 100) {
        throw new AppError(400, "Invalid discount. Must be between 0 and 100.");
      }
      fields.discount = discount;
    }

    if (stockRaw !== undefined) {
      const stock = validWholeNo(stockRaw);
      if (stock === null) {
        throw new AppError(400, "Invalid stock");
      }
      fields.stock = stock;
    }

    // Check if variant exists
    const [variants] = await db.execute(
      `SELECT cloudinary_id FROM ProductVariants WHERE variantID = ? AND is_active = TRUE`,
      [variantID]
    );

    if (variants.length === 0) {
      throw new AppError(404, 'Variant not found');
    }

    // Handle image upload
    let cloudinaryID;
    if (mainImgPath) {
      cloudinaryID = variants[0].cloudinary_id;
      const uploadedImage = await uploadOnCloudinary(mainImgPath);
      
      if (!uploadedImage?.url || !uploadedImage?.public_id) {
        throw new AppError(500, "Failed to upload image.");
      }      
      fields.main_image = uploadedImage.url;
      fields.cloudinary_id = uploadedImage.public_id;
    }

    if (Object.keys(fields).length === 0) {
      throw new AppError(400, "No valid fields provided for update");
    }

    // Construct update
    const setClause = Object.keys(fields).map(key => `${key} = ?`).join(', ');
    const values = Object.values(fields);
    values.push(variantID);

    await db.execute(
      `UPDATE ProductVariants SET ${setClause} WHERE variantID = ?`,
      values
    );

    res.status(200).json({ message: "Variant updated successfully", updatedFields: fields });

    // Delete old cloudinary image
    if (cloudinaryID) {
      deleteFromCloudinary(cloudinaryID).catch((error) => {
        logger.warn(`Cloudinary deletion failed. CloudinaryID:${cloudinaryID} ${error.message}`);
      });
    }

  } catch (error) {
    error.context = { variantID };
    next(error);

    if (fields.cloudinary_id) {
      const cloudinaryID = fields.cloudinary_id;
      deleteFromCloudinary(cloudinaryID).catch((error) => {
        logger.warn(`Cloudinary deletion failed. CloudinaryID:${cloudinaryID} ${error.message}`);
      });
    }

  } finally {
    if (mainImgPath) {
      deleteTempImg(mainImgPath).catch((error) => {
        logger.warn(`Failed to delete file ${mainImgPath}: ${error.message}`);
      });
    }
  }
};


export const getVariantsByProduct = async (req, res, next) => {
  const productID = validID(req.params.productID);

  try {
    if (productID === null) {
      throw new AppError(400, "Invalid productID");
    }

    // Check if product exists
    const [activeProduct] = await db.execute(
      "SELECT 1 FROM Products WHERE productID = ? AND is_active = TRUE",
      [productID]
    );
    if (activeProduct.length === 0){
      throw new AppError(404, "No product found.");
    }

    // Fetch all active variants of the product 
    const [variants] = await db.execute(`
      SELECT variantID, color, size, price, main_image, discount 
      FROM ProductVariants WHERE productID = ? AND is_active = TRUE
      ORDER BY created_at DESC
    `, [productID]);

    if (variants.length === 0){
      throw new AppError(404, "No variants found for this product");
    }

    res.status(200).json({
      message: "Fetched all variants of given product successfully",
      variants
    });
  } catch (error) {
    error.context = { productID };
    next(error);
  }
};


export const getAllVariants = async (req, res, next) => {
  const limit = validID(req.query.limit);
  const page = validID(req.query.page);

  try {
    if (limit === null || limit > constants.MAX_LIMIT){
      throw new AppError(400, `Limit must be a valid number below ${constants.MAX_LIMIT}`);
    }

    if(page === null){
      throw new AppError(400, "Page must be a valid number");
    }

    const offset = (page - 1) * limit;
    const [variants] = await db.execute(`
      SELECT 
        pv.variantID, 
        pv.productID, 
        pv.color, 
        pv.size, 
        pv.price, 
        pv.main_image, 
        pv.discount, 
        p.name AS product_name, 
        p.category
      FROM ProductVariants pv
      JOIN Products p ON pv.productID = p.productID
      WHERE pv.is_active = TRUE
      ORDER BY pv.created_at DESC
      LIMIT ? OFFSET ?
    `, [`${limit}`, `${offset}`]);

    // Get the total count of variants
    const [count] = await db.execute(`
      SELECT COUNT(*) AS count FROM ProductVariants WHERE is_active = TRUE
    `);

    res.status(200).json({
      message: "Fetched all variants successfully",
      total: count[0].count,
      variants
    });
  } catch (error) {
    next(error);
  }
};


export const getVariantById = async (req, res, next) => {
  const variantID = validID(req.params.variantID);

  try {
    if (variantID === null) {
      throw new AppError(400, "Invalid variantID");
    }

    // Get variant + product info
    const [variants] = await db.execute(`
      SELECT 
        pv.variantID, 
        pv.productID, 
        pv.color, 
        pv.size, 
        pv.price, 
        pv.main_image, 
        pv.discount, 
        p.name AS product_name, 
        p.category
      FROM ProductVariants pv
      JOIN Products p ON pv.productID = p.productID
      WHERE pv.variantID = ? AND pv.is_active = TRUE
    `, [variantID]);

    // Return if variant not found
    if (variants.length === 0) {
      throw new AppError(404, "Variant not found.");
    }
    const variant = variants[0];

    // Get secondary images for this variant
    const [images] = await db.execute(
      `SELECT variantImageID, image_url FROM VariantImages WHERE variantID = ?`,
      [variantID]
    );
    variant.secondary_images = images;

    res.status(200).json({
      message: "Fetched variant successfully",
      variant
    });

  } catch (error) {
    error.context = { variantID };
    next(error);
  }
};


export const deleteVariant = async (req, res, next) => {
  const variantID = validID(req.params.variantID);
  let conn;

  try {
    if (variantID === null) {
      throw new AppError(400, "Invalid variantID");
    }

    const [variant] = await db.execute(
      `SELECT 1 FROM ProductVariants WHERE variantID = ? AND is_active = TRUE`,
      [variantID]
    );

    // If variant not found return 
    if (variant.length === 0) {
      throw new AppError(404, 'Variant not found');
    }

    // Extracting secondary images cloudinaryIDs
    const [secondaryImgs] = await db.execute(
      `SELECT cloudinary_id FROM VariantImages WHERE variantID = ?`,
      [variantID]
    );

    conn = await db.getConnection(); // begin transaction
    await conn.beginTransaction();
    
    // Delete secondary images of this variant
    await conn.execute("DELETE FROM VariantImages WHERE variantID = ?", [variantID])
    // Delete this variant i.e set is_active = FALSE
    await conn.execute("UPDATE ProductVariants SET is_active = FALSE WHERE variantID=?", [variantID]);
    // Early response before deleting cloudinary images so that the client does not
    // need to wait for the deletion of all cloudinary images and any error in those does
    // not affect response
    await conn.commit();
    res.status(200).json({ message: "Variant deleted successfully" });

    // Delete secondary images from Cloudinary
    // Fire and forget, non blocking, does not affect response, does not use await
    secondaryImgs.forEach((image) => {
      const cloudinaryID = image.cloudinary_id;
      deleteFromCloudinary(cloudinaryID).catch((error) => {
        logger.warn(`Cloudinary deletion failed. CloudinaryID:${cloudinaryID} ${error.message}`);
      });
    });

  } catch (error) {
    if (conn) await conn.rollback();
    error.context = { variantID };
    next(error);

  } finally {
    if (conn) conn.release(); // release connection
  }
};


export const uploadSecondaryImages = async (req, res, next) => {
  const files = req.files;
  const variantID = validID(req.params.variantID);
  let conn;

  try {
    if (variantID === null) {
      throw new AppError(400, "Invalid variantID");
    }

    if (!files || files.length === 0) {
      throw new AppError(400, "No files were provided.");
    }

    // Check if variant exists
    const [variants] = await db.execute(
      `SELECT 1 FROM ProductVariants WHERE variantID = ? and is_active = TRUE`,
      [variantID]
    );

    if (variants.length === 0) {
      throw new AppError(404, 'Variant not found');
    }

    // To store public_id for possible rollback
    const uploadedImages = [];
    const insertedImages = [];

    conn = await db.getConnection();
    await conn.beginTransaction();

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
    next(error);

    // Fire-and-forget Cloudinary cleanup
    uploadedImages.forEach((cloudinaryID) => {
      deleteFromCloudinary(cloudinaryID).catch(error => {
        logger.warn(`Cloudinary deletion failed. CloudinaryID:${cloudinaryID} ${error.message}`);
      });
    });

  } finally {
    if (conn) conn.release();

    // Multer temp files cleanup
    for (const file of files) {
      deleteTempImg(file.path).catch((error) => {
        logger.warn(`Failed to delete file ${file.path}: ${error.message}`);
      })
    }
  }
};


export const deleteSecondaryImage = async (req, res, next) => {
  const variantImageID = validID(req.params.variantImageID);

  try {
    if (variantImageID === null) {
      throw new AppError(400, "Invalid variantImageID");
    }

    // Get image info from DB
    const [rows] = await db.execute(
      "SELECT cloudinary_id FROM VariantImages WHERE variantImageID = ?",
      [variantImageID]
    );

    if (rows.length === 0) {
      throw new AppError(404, "Image not found.");
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
      logger.warn(`Cloudinary deletion failed. CloudinaryID:${cloudinaryID} ${error.message}`);
    });

  } catch (error) {
    error.context = { variantImageID };
    next(error);
  }
};
