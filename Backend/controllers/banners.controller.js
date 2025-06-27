import { db } from '../index.js';
import { uploadOnCloudinary,deleteFromCloudinary } from "../utils/cloudinary.js";

 const addBanner = async (req, res) => {
  try {
    const { title } = req.body;
    const file = req.file ? req.file.path : null;

    if (!file) {
      return res.status(400).json({ message: "Banner image is required" });
    }


    const bannerImage = await uploadOnCloudinary(file);
    
    const [insertResult] = await db.execute(
      `INSERT INTO Banners (image_url, cloudinary_id, title) VALUES (?, ?, ?)`,
      [bannerImage.secure_url, bannerImage.public_id, title || null]
    );


    return res.status(201).json({
      message: "Banner added successfully",
      bannerID: insertResult.insertId,
      image_url: bannerImage.secure_url,
      cloudinary_id: bannerImage.public_id,
    });
  } catch (error) {
    console.error("Error adding banner:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteBanner = async (req, res) => {
    const { bannerID } = req.params;
  
    try {
      const [rows] = await db.execute(
        `SELECT cloudinary_id FROM Banners WHERE bannerID = ?`,
        [bannerID]
      );
  
      if (rows.length === 0) {
        return res.status(404).json({ message: "Banner not found" });
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
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  const getBanner = async (req, res) => {
    const { bannerID } = req.params;
  
    try {
      const [rows] = await db.execute(
        `SELECT * FROM Banners WHERE bannerID = ?`,
        [bannerID]
      );
  
      if (rows.length === 0) {
        return res.status(404).json({ message: "Banner not found" });
      }
  
      return res.status(200).json(rows[0]);
    } catch (error) {
      console.error("Error fetching banner:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  const getAllBanners = async (req, res) => {
    try {
      const [rows] = await db.execute(`SELECT * FROM Banners ORDER BY created_at DESC`);
  
      return res.status(200).json({
        total: rows.length,
        banners: rows,
      });
    } catch (error) {
      console.error("Error fetching banners:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

export {addBanner,deleteBanner,getBanner,getAllBanners}