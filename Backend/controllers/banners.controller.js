import { db } from '../index.js';
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import logger from '../utils/logger.js';
import { validID, validBoolean, validWholeNo, validString, validURL } from '../utils/validators.utils.js';
import { deleteTempImg } from '../utils/deleteTempImg.js';

// Main Banner Route ----------------------------------------------------------------------------

export const addMainBanner = async (req, res) => {
  let title = req.body.title;
  let redirect_url = req.body.redirect_url;
  const bannerPath = req.file ? req.file.path : null;
  const priority = validWholeNo(req.body.priority);
  const is_active = validBoolean(req.body.is_active);
  let cloudinaryID = null;
  let conn;

  try {
    // Validations
    if (is_active === null) {
      return res.status(400).json({
        error: "Give a valid boolean to tell whether banner is active or not",
      });
    }

    if (priority === null) {
      return res.status(400).json({ error: "Invalid priority" });
    }

    if (!bannerPath) {
      return res.status(400).json({ error: "Banner image is required" });
    }

    if (title) {
      title = validString(title);
      if(title === null){
        return res.status(400).json({ error: "Title must be a valid string" });
      }
    } else {
      title = null;
    }

    if (redirect_url) {
      redirect_url = validURL(redirect_url);
      if(redirect_url === null){
        return res.status(400).json({ error: "Redirect URL must be a valid URL" });
      }
    } else {
      redirect_url = null;
    }

    // Upload to Cloudinary first (before transaction)
    const cloudinaryResult = await uploadOnCloudinary(bannerPath);
    cloudinaryID = cloudinaryResult.public_id;

    // Start DB transaction
    conn = await db.getConnection();
    await conn.beginTransaction();

    // Priority shift if necessary
    // 1. Check if conflict exists
    const [result] = await conn.execute("SELECT priority FROM MainBanners WHERE priority = ?", [priority])
    if (result.length !== 0){
      // 2. Lock all rows that may be shifted
      const [lockRows] = await conn.execute(`
        SELECT priority FROM MainBanners WHERE priority >= ? FOR UPDATE
      `,[priority]);
      
      // 3. Shift conflicting rows
      await conn.execute(`
        UPDATE MainBanners SET priority = priority + 1
        WHERE priority >= ?
      `,[priority]);
    }

    // Insert the main banner
    const [insertResult] = await conn.execute(`
      INSERT INTO MainBanners 
      (image_url, cloudinary_id, title, is_active, redirect_url, priority)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        cloudinaryResult.url,
        cloudinaryID,
        title,
        is_active,
        redirect_url,
        priority
      ]
    );

    // Commit transaction
    await conn.commit();
    return res.status(201).json({
      message: "Banner added successfully",
      bannerID: insertResult.insertId,
      image_url: cloudinaryResult.url,
      is_active,
      redirect_url,
      priority,
    });

  } catch (error) {
    // Rollback if in transaction
    if (conn) await conn.rollback();
    res.status(500).json({ error: "Internal server error" });
    logger.error("Error adding banner:", error);

    // Cleanup Cloudinary if needed
    if (cloudinaryID) {
      deleteFromCloudinary(cloudinaryID).catch((error) => {
        logger.warn(`Cloudinary deletion failed. CloudinaryID:${cloudinaryID} ${error.message}`);
      });
    }

  } finally {
    if (conn) conn.release();
    if (bannerPath) {
      deleteTempImg(bannerPath).catch((error) => {
        logger.warn(`Failed to delete file ${bannerPath}: ${error.message}`);
      });
    }
  }
};


export const updateMainBanner = async (req, res) => {
  const bannerID = validID(req.params.bannerID);
  let { title, redirect_url, priority, is_active } = req.body;
  const fields = {};
  let conn;

  try {
    // Validate inputs
    if (bannerID === null){
      return res.status(400).json({ error: "Invalid bannerID" });
    }

    // check if banner exists
    const [checkBanner] = await db.execute("SELECT 1 FROM MainBanners WHERE bannerID = ?",[bannerID]);
    if(checkBanner.length === 0){
      return res.status(400).json({ error: "No main banner found" });
    }

    if (priority) {
      priority = validWholeNo(priority);
      if (priority === null) {
        return res.status(400).json({ error: "Invalid priority" });
      }
      fields.priority = priority;
    }

    if (is_active !== null && is_active !== undefined && is_active !== "") {
      is_active = validBoolean(is_active);
      if (is_active === null) {
        return res.status(400).json({ error: "Invalid is_active boolean" });
      }
      fields.is_active = is_active;

      if(!fields.is_active){
        const [otherActive] = await db.execute(`
          SELECT COUNT(*) AS active_count
          FROM MainBanners
          WHERE is_active = TRUE AND bannerID != ?
        `, [bannerID]);
        if(otherActive[0].active_count === 0){
          return res.status(400).json({ error: "Cannot disable the only active main banner" });
        }
      }
    }

    if (title) {
      title = validString(title);
      if(title === null){
        return res.status(400).json({ error: "Title must be a valid string" });
      }
      fields.title = title;
    }

    if (redirect_url) {
      redirect_url = validURL(redirect_url);
      if(redirect_url === null){
        return res.status(400).json({ error: "Redirect URL must be a valid URL" });
      }
      fields.redirect_url = redirect_url;
    }

    if (Object.keys(fields).length === 0) {
      return res.status(400).json({ error: "No valid fields provided for update" });
    }

    // Begin transaction
    conn = await db.getConnection();
    await conn.beginTransaction();

    // lock main banner
    await conn.execute("SELECT 1 FROM MainBanners WHERE bannerID = ? FOR UPDATE", [bannerID]);

    // If priority then do shifting if necessary
    if (fields.priority) {
      // Check if needs to be updated i.e priority clash with any other banner
      const [check] = await conn.execute(
        `SELECT 1 FROM MainBanners WHERE priority = ? AND bannerID != ?`,
        [fields.priority, bannerID]
      );

      // Priority clash needs to be shifted
      if (check.length !== 0) {
        // lock rows
        await conn.execute(`
          SELECT priority FROM MainBanners WHERE priority >= ? FOR UPDATE
        `,[fields.priority]);

        await conn.execute(`
          UPDATE MainBanners SET priority = priority + 1
          WHERE priority >= ?
        `,[fields.priority]);
      }
    }

    // Construct update
    const setClause = Object.keys(fields).map(key => `${key} = ?`).join(', ');
    const values = Object.values(fields);
    values.push(bannerID);

    await conn.execute(
      `UPDATE MainBanners SET ${setClause} WHERE bannerID = ?`,
      values
    );

    await conn.commit();
    return res.status(200).json({ message: "Banner updated successfully" });

  } catch (error) {
    if (conn) await conn.rollback();
    res.status(500).json({ error: "Internal server error" });
    logger.error(`Error updating main banner bannerID:${bannerID} `, error);
    
  } finally {
    if (conn) conn.release();
  }
};


// Side Banner Controllers --------------------------------------------------------------------------

export const addSideBanner = async (req, res) => {
  let title = req.body.title; // optional
  let redirect_url = req.body.redirect_url; // optional
  const bannerPath = req.file ? req.file.path : null; // required
  const is_active = validBoolean(req.body.is_active); // required
  let cloudinaryID = null;
  let conn;

  try {
    // Validations
    if (!bannerPath) {
      return res.status(400).json({ error: "Banner image is required" });
    }

    // Validate is_active
    if (is_active === null) {
      return res.status(400).json({ error: "is_active must be true or false" });
    }

    if (title) {
      title = validString(title);
      if(title === null){
        return res.status(400).json({ error: "Title must be a valid string" });
      }
    } else {
      title = null;
    }

    if (redirect_url) {
      redirect_url = validURL(redirect_url);
      if(redirect_url === null){
        return res.status(400).json({ error: "Redirect URL must be a valid URL" });
      }
    } else {
      redirect_url = null;
    }

    // Upload to Cloudinary
    const cloudinaryResult = await uploadOnCloudinary(bannerPath);
    cloudinaryID = cloudinaryResult.public_id;

    // Start transaction
    conn = await db.getConnection();
    await conn.beginTransaction();

    // If banner is to be active, deactivate the currently active one
    if (is_active) {
      await conn.execute(
        `UPDATE SideBanners SET is_active = FALSE WHERE is_active = TRUE`
      );
    }

    // Insert new banner
    const [insertResult] = await conn.execute(
      `INSERT INTO SideBanners 
       (image_url, cloudinary_id, title, redirect_url, is_active)
       VALUES (?, ?, ?, ?, ?)`,
      [
        cloudinaryResult.url,
        cloudinaryID,
        title,
        redirect_url,
        is_active
      ]
    );

    await conn.commit();

    return res.status(201).json({
      message: "Side banner added successfully",
      bannerID: insertResult.insertId,
      image_url: cloudinaryResult.url,
      is_active,
      redirect_url
    });

  } catch (error) {
    if (conn) await conn.rollback();
    res.status(500).json({ error: "Internal server error" });
    logger.error("Error adding side banner:", error);

    if (cloudinaryID) {
      deleteFromCloudinary(cloudinaryID).catch((error) => {
        logger.warn(`Cloudinary deletion failed. CloudinaryID:${cloudinaryID} ${error.message}`);
      });
    }

  } finally {
    if(conn) conn.release();
    if (bannerPath) {
      deleteTempImg(bannerPath).catch((error) => {
        logger.warn(`Failed to delete file ${bannerPath}: ${error.message}`);
      });
    }
  }
};


export const updateSideBanner = async (req, res) => {
  const bannerID = validID(req.params.bannerID);
  let { title, redirect_url, is_active } = req.body;
  const fields = {};
  let conn;

  if (bannerID === null) {
    return res.status(400).json({ error: "Invalid bannerID" });
  }

  if (is_active !== null && is_active !== undefined && is_active !== "") {
    is_active = validBoolean(is_active);
    if (is_active === null) {
      return res.status(400).json({ error: "Invalid is_active boolean" });
    }
    fields.is_active = is_active;
  }

  if (title) {
    title = validString(title);
    if(title === null){
      return res.status(400).json({ error: "Title must be a valid string" });
    }
    fields.title = title;
  }

  if (redirect_url) {
    redirect_url = validURL(redirect_url);
    if(redirect_url === null){
      return res.status(400).json({ error: "Redirect URL must be a valid URL" });
    }
    fields.redirect_url = redirect_url;
  }

  if (Object.keys(fields).length === 0) {
    return res.status(400).json({ error: "No valid fields provided for update" });
  }

  try {
    const [checkBanner] = await db.execute("SELECT 1 FROM SideBanners WHERE bannerID = ?",[bannerID]);
    if(checkBanner.length === 0){
      return res.status(400).json({ error: "No side banner found" });
    }

    conn = await db.getConnection();
    await conn.beginTransaction();

    // If is_active is being set to true, deactivate others
    if (fields.is_active === true) {
      await conn.execute(
        `UPDATE SideBanners SET is_active = FALSE WHERE is_active = TRUE AND bannerID != ?`,
        [bannerID]
      );
    }

    // Construct update
    const setClause = Object.keys(fields).map(key => `${key} = ?`).join(', ');
    const values = Object.values(fields);
    values.push(bannerID);

    const [result] = await conn.execute(
      `UPDATE SideBanners SET ${setClause} WHERE bannerID = ?`,
      values
    );

    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "Banner not found or nothing updated" });
    }

    await conn.commit();
    res.status(200).json({ message: "Side banner updated successfully" });

  } catch (error) {
    if (conn) await conn.rollback();
    res.status(500).json({ error: "Internal server error" });
    logger.error("Error updating side banner:", error.message);

  } finally {
    if (conn) conn.release();
  }
};


// Common Controllers ------------------------------------------------------------------------------
export const deleteBanner = async (req, res) => {
  const bannerID  = validID(req.params.bannerID);
  const type = req.query.type;

  if (bannerID === null) {
    return res.status(400).json({error:"Invalid BannerID"});
  }

  if (typeof type !== 'string'){
    return res.status(400).json({ error: "Invalid type (main/side) required" });
  }
  type = type.trim();
  type = type.toLowerCase();
  if (type !== 'main' && type !== 'side') {
    return res.status(400).json({ error: "Invalid type (main/side) required" });
  }

  const table = type === 'main' ? 'MainBanners' : 'SideBanners';

  try {
    // Check if banner exists
    const [rows] = await db.execute(
      `SELECT cloudinary_id, is_active FROM ${table} WHERE bannerID = ?`,
      [bannerID]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Banner not found" });
    }

    // Cannot delete the only active main banner
    if (type === 'main') {
      const [otherActive] = await db.execute(`
        SELECT COUNT(*) AS active_count
        FROM MainBanners
        WHERE is_active = TRUE AND bannerID != ?
      `, [bannerID]);

      if (otherActive[0].active_count === 0) {
        return res.status(400).json({ error: "Cannot delete the only active main banner" });
      }
    }

    // Cannot delete active side banner
    if (type === 'side' && rows[0].is_active === true){
      return res.status(400).json({ error: "Cannot delete the active side banner" });
    }

    const cloudinaryID = rows[0].cloudinary_id;

    await db.execute(`DELETE FROM ${table} WHERE bannerID = ?`, [bannerID]);
    res.status(200).json({ message: "Banner deleted successfully" });

    if (cloudinaryID) {
      deleteFromCloudinary(cloudinaryID).catch((error) => {
        logger.warn(`Cloudinary deletion failed. CloudinaryID:${cloudinaryID} ${error.message}`);
      });
    }
  } catch (error) {
    logger.error(`Error deleting bannerID:${bannerID} type:${type} `, error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


export const getBanner = async (req, res) => {
  const bannerID = validID(req.params.bannerID);
  const type = req.query.type;

  if (bannerID === null) {
    return res.status(400).json({error:"Invalid bannerID"})
  }

  if (typeof type !== 'string'){
    return res.status(400).json({ error: "Invalid type (main/side) required" });
  }
  type = type.trim();
  type = type.toLowerCase();
  if (type !== 'main' && type !== 'side') {
    return res.status(400).json({ error: "Invalid type (main/side) required" });
  }

  const table = type === 'main' ? 'MainBanners' : 'SideBanners';

  try {
    const [rows] = await db.execute(`SELECT * FROM ${table} WHERE bannerID = ?`, [bannerID]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Banner not found" });
    }

    return res.status(200).json({
      message: "Fetched banner successfully", 
      banner: rows[0] 
    });

  } catch (error) {
    logger.error("Error fetching banner:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};


export const getAllBanners = async (req, res) => {
  try {
    const [mainBanners] = await db.execute("SELECT * FROM MainBanners ORDER BY created_at DESC");
    const [sideBanners] = await db.execute("SELECT * FROM SideBanners ORDER BY created_at DESC")

    return res.status(200).json({
      message: "Fetched all banners successfully", 
      mainBanners,
      sideBanners
    });
  } catch (error) {
    logger.error("Error fetching all banners:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
