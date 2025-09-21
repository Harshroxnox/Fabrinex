import { db } from '../index.js';
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import logger from '../utils/logger.js';
import { validWholeNo } from '../utils/validators.utils.js';
import { deleteTempImg } from '../utils/deleteTempImg.js';

// Upload Bill Route
export const uploadBill = async (req, res) => {
  const wholesaler_name = req.body.wholesaler_name?.trim() || null;
  const bill_date = req.body.bill_date?.trim() || null; 
  const billPath = req.file ? req.file.path : null;
  let cloudinaryID = null;
  let connection;

  try {
    if (!wholesaler_name) {
      return res.status(400).json({ error: "Wholesaler name is required" });
    }

    if (!bill_date) {
      return res.status(400).json({ error: "Bill date is required" });
    }

    if (!billPath) {
      return res.status(400).json({ error: "Bill PDF is required" });
    }

    // Upload PDF to Cloudinary (store as raw file)
    const cloudinaryResult = await uploadOnCloudinary(billPath, {
      resource_type: "raw",
      folder: "bills" 
    });
    cloudinaryID = cloudinaryResult.public_id;
    // Start DB transaction
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [insertResult] = await connection.execute(
      `INSERT INTO Bills (bill_date, wholesaler_name, pdf_url,cloudinary_id) 
       VALUES (?, ?, ?,?)`,
      [bill_date, wholesaler_name, cloudinaryResult.url,cloudinaryID]
    );

    // Commit transaction
    await connection.commit();

    return res.status(201).json({
      message: "Bill uploaded successfully",
      billID: insertResult.insertId,
      pdf_url: cloudinaryResult.url,
      cloudinary_id: cloudinaryID,
      wholesaler_name,
      bill_date
    });

  } catch (error) {
    logger.error("Error uploading bill:", error.message);
    console.log("Error uploading bill:", error.message)

    // Rollback if in transaction 
    if (connection) {
      await connection.rollback();
    }

    res.status(500).json({ error: "Internal server error" });

    // Cleanup Cloudinary if upload succeeded but DB failed
    if (cloudinaryID) {
      deleteFromCloudinary(cloudinaryID).catch((err) => {
        logger.warn(`Cloudinary cleanup failed: ${cloudinaryID} ${err.message}`);
      });
    }

  } finally {
    if (connection) connection.release();
    if (billPath) {
      deleteTempImg(billPath).catch((err) => {
        logger.warn(`Temp file deletion failed: ${billPath} ${err.message}`);
      });
    }
  }
};

export const deleteBill = async (req, res) => {
  const { id } = req.params;
  let connection;

  try {
    // 1. Validate the ID
    if (!validWholeNo(id)) { // Assumes validWholeNo checks for a positive integer
      return res.status(400).json({ error: "Invalid Bill ID provided" });
    }
    const billID = parseInt(id, 10);

    // 2. Start DB transaction
    connection = await db.getConnection();
    await connection.beginTransaction();

    // 3. Find the bill to get its cloudinary_id
    const [rows] = await connection.execute(
      `SELECT cloudinary_id FROM Bills WHERE billID = ?`,
      [billID]
    );

    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Bill not found" });
    }
    const cloudinaryID = rows[0].cloudinary_id;

    // 4. Delete the bill from the database first
    await connection.execute(
      `DELETE FROM Bills WHERE billID = ?`,
      [billID]
    );

    // 5. Delete the file from Cloudinary (if a cloudinaryID exists)
    if (cloudinaryID) {
      await deleteFromCloudinary(cloudinaryID, { resource_type: 'raw' });
    }

    // 6. If all succeeds, commit the transaction
    await connection.commit();

    return res.status(200).json({ message: "Bill deleted successfully" });

  } catch (error) {
    console.error("Error deleting bill:", error.message);
    // If anything fails, roll back the transaction
    if (connection) {
      await connection.rollback();
    }
    res.status(500).json({ error: "Internal server error" });
  } finally {
    // 7. Always release the connection
    if (connection) {
      connection.release();
    }
  }
};