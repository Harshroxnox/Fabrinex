import { db } from '../index.js';
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import logger from '../utils/logger.js';
import { validID ,validBoolean} from '../utils/validators.utils.js';
import { deleteTempImg } from '../utils/deleteTempImg.js';


export const addBanner = async (req, res) => {
  const title = req.body.title?.trim() || null;
  const is_side = validBoolean(req.body.is_side);
  const redirect_url = req.body.redirect_url?.trim() || null;
  const bannerPath = req.file ? req.file.path : null;
  let cloudinaryID = null;

  try {

  // VALIDATION
  if (bannerPath === null) {
    return res.status(400).json({ error: "Banner image is required" });
  }
 console.log(typeof is_side)
  if (typeof is_side !== 'boolean') {
    return res.status(400).json({ error: "you must specify that banner is side aur main and it must be a boolean (true or false)" });
  }

    const cloudinaryResult = await uploadOnCloudinary(bannerPath);
    cloudinaryID = cloudinaryResult.public_id;

    const [insertResult] = await db.execute(
      `INSERT INTO Banners (image_url, cloudinary_id, title, is_side, redirect_url)
       VALUES (?, ?, ?, ?, ?)`,
      [
        cloudinaryResult.url,
        cloudinaryID,
        title,
        is_side,
        redirect_url
      ]
    );

    return res.status(201).json({
      message: "Banner added successfully",
      bannerID: insertResult.insertId,
      image_url: cloudinaryResult.url,
      cloudinary_id: cloudinaryID,
      is_side,
      redirect_url
    });

  } catch (error) {
    logger.error("Error adding banner:", error);

    if (cloudinaryID) {
      deleteFromCloudinary(cloudinaryID).catch((err) => {
        logger.warn(`Cloudinary cleanup failed: ${cloudinaryID} ${err.message}`);
      });
    }

    return res.status(500).json({ error: "Internal server error" });

  } finally {
    if (bannerPath) {
      deleteTempImg(bannerPath).catch((err) => {
        logger.warn(`Temp image deletion failed: ${bannerPath} ${err.message}`);
      });
    }
  }
};

export const updateBanner = async (req, res) => {
  const bannerID = validID(req.params.bannerID);
  const { title, redirect_url, is_active, is_side } = req.body;

  try {
  if (bannerID === null) {
    return res.status(400).json({ error: "Invalid bannerID" });
  }

  // Validate boolean fields if provided
  if ('is_active' in req.body && typeof is_active !== 'boolean') {
    return res.status(400).json({ error: "`is_active` must be a boolean (true or false)" });
  }

  if ('is_side' in req.body && typeof is_side !== 'boolean') {
    return res.status(400).json({ error: "`is_side` must be a boolean (true or false)" });
  }

    // Check if banner exists
    const [rows] = await db.execute(`SELECT * FROM Banners WHERE bannerID = ?`, [bannerID]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Banner not found" });
    }

    const fields = [];
    const values = [];

    if (title !== undefined) {
      fields.push("title = ?");
      values.push(title);
    }

    if (redirect_url !== undefined) {
      fields.push("redirect_url = ?");
      values.push(redirect_url);
    }

    if (is_active !== undefined) {
      fields.push("is_active = ?");
      values.push(is_active);
    }

    if (is_side !== undefined) {
      fields.push("is_side = ?");
      values.push(is_side);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No valid fields provided to update" });
    }

    values.push(bannerID); // For WHERE clause

    const sql = `UPDATE Banners SET ${fields.join(", ")} WHERE bannerID = ?`;
    await db.execute(sql, values);

    return res.status(200).json({ message: "Banner updated successfully" });

  } catch (error) {
    logger.error("Error updating banner:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteBanner = async (req, res) => {
  const bannerID  = validID(req.params.bannerID);

  if(bannerID===null){
    return res.status(400).json({error:"Invalid BannerID"});
  }

  try {
    const [rows] = await db.execute(
      `SELECT cloudinary_id FROM Banners WHERE bannerID = ?`,
      [bannerID]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Banner not found" });
    }

    const cloudinaryID = rows[0].cloudinary_id;
    
    await db.execute(`DELETE FROM Banners WHERE bannerID = ?`, [bannerID]);
    
    res.status(200).json({message: "Banner deleted successfully"});

    if (cloudinaryID) {
      deleteFromCloudinary(cloudinaryID).catch((error) => {
        logger.warn(`Cloudinary deletion failed. ${error.message} CloudinaryID:${cloudinaryID}`);
      });
    }
  } catch (error) {
    logger.error("Error deleting banner:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};


export const getBanner = async (req, res) => {
  const bannerID  = validID(req.params.bannerID);

  if(bannerID===null){
    return res.status(400).json({error:"Invalid BannerID"});
  }

  try {
    const [rows] = await db.execute(
      `SELECT * FROM Banners WHERE bannerID = ?`,
      [bannerID]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Banner not found" });
    }

    return res.status(200).json({
      message: "Fetched banner successfully", 
      banner: rows[0] 
    });
  } catch (error) {
    console.error("Error fetching banner:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


export const getAllBanners = async (req, res) => {
  try {
    const [rows] = await db.execute(`SELECT * FROM Banners ORDER BY created_at DESC`);

    return res.status(200).json({
      message: "Fetched all banners successfully", 
      total: rows.length,
      banners: rows,
    });
  } catch (error) {
    console.error("Error fetching all banners:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
