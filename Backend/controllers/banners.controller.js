import { db } from '../index.js';
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";


export const addBanner = async (req, res) => {
  try {
    const { title } = req.body || null;
    const file = req.file ? req.file.path : null;

    if (!file) {
      return res.status(400).json({ error: "Banner image is required" });
    }

    const bannerImage = await uploadOnCloudinary(file);
    
    const [insertResult] = await db.execute(
      `INSERT INTO Banners (image_url, cloudinary_id, title) VALUES (?, ?, ?)`,
      [bannerImage.url, bannerImage.public_id, title]
    );

    return res.status(201).json({
      message: "Banner added successfully",
      bannerID: insertResult.insertId,
      image_url: bannerImage.url,
      cloudinary_id: bannerImage.public_id,
    });

  } catch (error) {
    console.error("Error adding banner:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


export const deleteBanner = async (req, res) => {
  const { bannerID } = req.params;

  try {
    const [rows] = await db.execute(
      `SELECT cloudinary_id FROM Banners WHERE bannerID = ?`,
      [bannerID]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Banner not found" });
    }

    const cloudinary_id = rows[0].cloudinary_id;
    const cloudinaryResponse = await deleteFromCloudinary(cloudinary_id);
  
    await db.execute(`DELETE FROM Banners WHERE bannerID = ?`, [bannerID]);

    return res.status(200).json({
      message: "Banner deleted successfully",
      cloudinaryResponse,
    });
  } catch (error) {
    console.error("Error deleting banner:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


export const getBanner = async (req, res) => {
  const { bannerID } = req.params;

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
