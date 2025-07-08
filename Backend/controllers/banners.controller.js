import { db } from '../index.js';
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import logger from '../utils/logger.js';
import { validID ,validBoolean, validWholeNo} from '../utils/validators.utils.js';
import { deleteTempImg } from '../utils/deleteTempImg.js';

//Main Banner Route

export const addMainBanner = async (req, res) => {
  const title = req.body.title?.trim() || null;
  const redirect_url = req.body.redirect_url?.trim() || null;
  const bannerPath = req.file ? req.file.path : null;
  let priority = req.body.priority;
  const is_active = validBoolean(req.body.is_active);
  let cloudinaryID = null;
  let connection;

  try {
    if (is_active === null) {
      return res.status(400).json({
        error: "Give a valid boolean to tell whether banner is active or not",
      });
    }

    if (!bannerPath) {
      return res.status(400).json({ error: "Banner image is required" });
    }

    // Upload to Cloudinary first (before transaction)
    const cloudinaryResult = await uploadOnCloudinary(bannerPath);
    cloudinaryID = cloudinaryResult.public_id;

    // Start DB transaction
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Handle priority logic inside transaction
    if (priority !== undefined) {
      priority = validWholeNo(priority);
      if (priority===null) {
        return res.status(400).json({ error: "Invalid priority" });
      }

      await connection.execute(
        `UPDATE MainBanners
         SET priority = priority + 1
         WHERE priority >= ?`,
        [priority]
      );
    } else {
      const [rows] = await connection.execute(
        `SELECT MAX(priority) as maxPriority FROM MainBanners`
      );
      const maxPriority = rows[0]?.maxPriority ?? 0;
      priority = maxPriority + 1;
    }

    const [insertResult] = await connection.execute(
      `INSERT INTO MainBanners 
       (image_url, cloudinary_id, title, is_active, redirect_url, priority)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        cloudinaryResult.url,
        cloudinaryID,
        title,
        is_active,
        redirect_url,
        priority,
      ]
    );

    // Commit transaction
    await connection.commit();

    return res.status(201).json({
      message: "Banner added successfully",
      bannerID: insertResult.insertId,
      image_url: cloudinaryResult.url,
      cloudinary_id: cloudinaryID,
      is_active,
      redirect_url,
      priority,
    });

  } catch (error) {
    logger.error("Error adding banner:", error.message);

    // Rollback if in transaction
    if (connection) {
      await connection.rollback();

    }

    res.status(500).json({ error: "Internal server error" });

    // Cleanup Cloudinary if needed
    if (cloudinaryID) {
      deleteFromCloudinary(cloudinaryID).catch((err) => {
        logger.warn(`Cloudinary cleanup failed: ${cloudinaryID} ${err.message}`);
      });
    }


  } finally {
    if(connection)connection.release();
    if (bannerPath) {
      deleteTempImg(bannerPath).catch((err) => {
        logger.warn(`Temp image deletion failed: ${bannerPath} ${err.message}`);
      });
    }
  }
};

export const updateMainBanner = async (req, res) => {
  const bannerID = validID(req.params.bannerID);
  if (bannerID === null) {
    return res.status(400).json({ error: "Invalid banner ID" });
  }

  const { title, redirect_url } = req.body;
  let { priority, is_active } = req.body;
  const updates = [];
  const values = [];
  let connection;

  try {
    // Validate inputs
    if (priority !== undefined) {
      priority = validWholeNo(priority);
      if (priority === null) {
        return res.status(400).json({ error: "Invalid priority" });
      }
    }

    if (is_active !== undefined) {
      is_active = validBoolean(is_active);
      if (is_active === null) {
        return res.status(400).json({ error: "Invalid is_active boolean" });
      }
    }

    // Begin transaction
    connection = await db.getConnection();
    await connection.beginTransaction();

    // If priority is changing, do shifting
    if (priority !== undefined) {
      // Get current priority
      const [existingRows] = await connection.execute(
        `SELECT priority FROM MainBanners WHERE bannerID = ?`,
        [bannerID]
      );
      if (existingRows.length === 0) {
        return res.status(404).json({ error: "Banner not found" });
      }

      const currentPriority = existingRows[0].priority;

      if (priority !== currentPriority) {
        const [rows] = await connection.execute(
          `SELECT bannerID, priority FROM MainBanners 
           WHERE priority >= ? AND bannerID != ? ORDER BY priority DESC`,
          [priority, bannerID]
        );

        for (const row of rows) {
          await connection.execute(
            `UPDATE MainBanners SET priority = ? WHERE bannerID = ?`,
            [row.priority + 1, row.bannerID]
          );
        }

        updates.push("priority = ?");
        values.push(priority);
      }
    }

    // Add other dynamic updates
    if (title !== undefined) {
      updates.push("title = ?");
      values.push(title?.trim() || null);
    }

    if (redirect_url !== undefined) {
      updates.push("redirect_url = ?");
      values.push(redirect_url?.trim() || null);
    }

    if (is_active !== undefined) {
      updates.push("is_active = ?");
      values.push(is_active);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(bannerID); // for WHERE clause

    await connection.execute(
      `UPDATE MainBanners SET ${updates.join(", ")} WHERE bannerID = ?`,
      values
    );

    await connection.commit();

    return res.status(200).json({ message: "Banner updated successfully" });

  } catch (error) {
    logger.error("Error updating banner:", error.message);
    if (connection) await connection.rollback();
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (connection) connection.release();
  }
};


//Side Banner Controllers

export const addSideBanner = async (req, res) => {
  const title = req.body.title?.trim() || null;
  const redirect_url = req.body.redirect_url?.trim() || null;
  const bannerPath = req.file ? req.file.path : null;
  const is_active = validBoolean(req.body.is_active);
  let cloudinaryID = null;
  let connection;

  try {
    // Validate image
    if (!bannerPath) {
      return res.status(400).json({ error: "Banner image is required" });
    }

    // Validate is_active
    if (is_active === null) {
      return res.status(400).json({ error: "is_active must be true or false" });
    }

    // Upload to Cloudinary
    const cloudinaryResult = await uploadOnCloudinary(bannerPath);
    cloudinaryID = cloudinaryResult.public_id;

    // Start transaction
    connection = await db.getConnection();
    await connection.beginTransaction();

    // If banner is to be active, deactivate the currently active one
    if (is_active) {
      await connection.execute(
        `UPDATE SideBanners SET is_active = FALSE WHERE is_active = TRUE`
      );
    }

    // Insert new banner
    const [insertResult] = await connection.execute(
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

    await connection.commit();

    return res.status(201).json({
      message: "Side banner added successfully",
      bannerID: insertResult.insertId,
      image_url: cloudinaryResult.url,
      cloudinary_id: cloudinaryID,
      is_active,
      redirect_url
    });

  } catch (error) {
    logger.error("Error adding side banner:", error.message);

    if (connection) {
      await connection.rollback();
      
    }

    if (cloudinaryID) {
      deleteFromCloudinary(cloudinaryID).catch((err) => {
        logger.warn(`Cloudinary cleanup failed: ${cloudinaryID} ${err.message}`);
      });
    }

    return res.status(500).json({ error: "Internal server error" });

  } finally {
    if(connection)connection.release();
    if (bannerPath) {
      deleteTempImg(bannerPath).catch((err) => {
        logger.warn(`Temp image deletion failed: ${bannerPath} ${err.message}`);
      });
    }
  }
};

export const updateSideBanner = async (req, res) => {
  const bannerID = validID(req.params.bannerID);
  const title = req.body.title?.trim();
  const redirect_url = req.body.redirect_url?.trim();
  const is_active = req.body.is_active !== undefined ? validBoolean(req.body.is_active) : undefined;
  let connection;

  if (!bannerID) {
    return res.status(400).json({ error: "Invalid bannerID" });
  }

  if (is_active === null && req.body.is_active !== undefined) {
    return res.status(400).json({ error: "Invalid is_active boolean value" });
  }

  // Build dynamic query
  const updates = [];
  const values = [];

  if (title !== undefined) {
    updates.push("title = ?");
    values.push(title);
  }

  if (redirect_url !== undefined) {
    updates.push("redirect_url = ?");
    values.push(redirect_url);
  }

  if (is_active !== undefined) {
    updates.push("is_active = ?");
    values.push(is_active);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: "No valid fields provided for update" });
  }

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // If is_active is being set to true, deactivate others
    if (is_active === true) {
      await connection.execute(
        `UPDATE SideBanners SET is_active = FALSE WHERE is_active = TRUE AND bannerID != ?`,
        [bannerID]
      );
    }

    const updateQuery = `UPDATE SideBanners SET ${updates.join(", ")} WHERE bannerID = ?`;
    values.push(bannerID);

    const [result] = await connection.execute(updateQuery, values);

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Banner not found or nothing updated" });
    }

    await connection.commit();
    res.status(200).json({ message: "Side banner updated successfully" });

  } catch (error) {
    logger.error("Error updating side banner:", error.message);
    if (connection) await connection.rollback();
    res.status(500).json({ error: "Internal server error" });

  } finally {
    if (connection) connection.release();
  }
};

//Common Controllers
export const deleteBanner = async (req, res) => {
  const bannerID  = validID(req.params.bannerID);
  const type = req.query.type;

  if(bannerID===null){
    return res.status(400).json({error:"Invalid BannerID"});
  }

  if (type !== 'main' && type !== 'side'){
    return res.status(400).json({ error: "Invalid bannerID or type (main/side) required" });
  }

  const table = type === 'main' ? 'MainBanners' : 'SideBanners';

  try {
    const [rows] = await db.execute(
      `SELECT cloudinary_id FROM ${table} WHERE bannerID = ?`,
      [bannerID]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Banner not found" });
    }

    const cloudinaryID = rows[0].cloudinary_id;
    
    await db.execute(`DELETE FROM ${table} WHERE bannerID = ?`, [bannerID]);
    
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
  const bannerID = validID(req.params.bannerID);
  const type = req.query.type;

  if(bannerID===null){
    return res.status(400).json({error:"Invalid bannerID"})
  }

  if (type !== 'main' && type !== 'side'){
    return res.status(400).json({ error: "Invalid bannerID or type (main/side) required" });
  }

  const table = type === 'main' ? 'MainBanners' : 'SideBanners';

  try {
    const [rows] = await db.execute(`SELECT * FROM ${table} WHERE bannerID = ?`, [bannerID]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Banner not found" });
    }

    return res.status(200).json({ banner: rows[0] });

  } catch (error) {
    logger.error("Error fetching banner:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};



export const getAllBanners = async (req, res) => {

  const type = req.query.type;

  console.log(type)
  if (type !== 'main' && type !== 'side'){
    return res.status(400).json({ error: "Invalid type ,(main/side) required" });
  }

  const table = type === 'main' ? 'MainBanners' : 'SideBanners';

  try {
    const [rows] = await db.execute(`SELECT * FROM ${table} ORDER BY created_at DESC`);

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
