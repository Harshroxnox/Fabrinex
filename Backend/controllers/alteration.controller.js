import { db } from '../index.js';
import AppError from '../errors/appError.js';
import { 
  validString, 
  validDecimal, 
  validID 
} from '../utils/validators.utils.js'; 
import { uploadOnCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';
import { deleteTempImg } from '../utils/deleteTempImg.js';
import logger from '../utils/logger.js';

// 1. Create Alteration Record
export const createAlteration = async (req, res, next) => {
  const billNo = validString(req.body.bill_no);
  const slipNo = validString(req.body.slip_no);
  const customerName = validString(req.body.customer_name);
  const contact = validString(req.body.contact, 10, 15);
  const dimensionText = validString(req.body.dimension_text, 0, 1000); 
  const dateOfDeliveryRaw = req.body.date_of_delivery;
  const statusRaw = req.body.status || 'Pending';
  const amount = validDecimal(req.body.amount);
  const paymentStatusRaw = req.body.payment_status || 'Unpaid';

  const dimensionImgPath = req.file ? req.file.path : null;
  let cloudinaryID;

  try {
    // --- VALIDATIONS ---
    if (!customerName) throw new AppError(400, "Customer Name is required");
    if (!contact) throw new AppError(400, "Contact number is required");
    if (!amount || amount < 0) throw new AppError(400, "Invalid amount");
    if (!dateOfDeliveryRaw) throw new AppError(400, "Date of delivery is required");

    // Validate Enums
    const allowedStatus = ['Pending', 'Ready', 'Delivered'];
    const allowedPayment = ['Paid', 'Unpaid'];
    
    if (!allowedStatus.includes(statusRaw)) throw new AppError(400, "Invalid Status");
    if (!allowedPayment.includes(paymentStatusRaw)) throw new AppError(400, "Invalid Payment Status");

    // --- IMAGE UPLOAD ---
    let mainImgUrl = null;
    if (dimensionImgPath) {
      const uploadResult = await uploadOnCloudinary(dimensionImgPath);
      if (!uploadResult?.url) throw new AppError(500, "Image upload failed");
      
      mainImgUrl = uploadResult.url;
      cloudinaryID = uploadResult.public_id;
    }

    // --- DB INSERTION ---
    const [result] = await db.execute(
      `INSERT INTO AlterationRecords 
      (bill_no, slip_no, customer_name, contact, dimension_image, cloudinary_id, dimension_text, date_of_delivery, status, amount, payment_status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        billNo,
        slipNo,
        customerName,
        contact,
        mainImgUrl,
        cloudinaryID || null,
        dimensionText,
        dateOfDeliveryRaw,
        statusRaw,
        amount,
        paymentStatusRaw
      ]
    );

    res.status(201).json({
      message: "Alteration record created successfully",
      alterationID: result.insertId
    });

  } catch (error) {
    // Cleanup Cloudinary image if DB insert fails
    if (cloudinaryID) {
      deleteFromCloudinary(cloudinaryID).catch(err => 
        logger.warn(`Cloudinary deletion failed: ${err.message}`)
      );
    }
    next(error);
  } finally {
    // Cleanup local temp file
    if (dimensionImgPath) {
      deleteTempImg(dimensionImgPath).catch(err => 
        logger.warn(`Temp file deletion failed: ${err.message}`)
      );
    }
  }
};

// 2. Get All Alterations (Sorted by Nearest Date)
export const getAlterations = async (req, res, next) => {
  try {
    // Logic:
    // 1. Show 'Pending' or 'Ready' items first (incomplete work).
    // 2. Sort by Date: Ascending (Oldest/Nearest dates first).
    // 3. We use DATEDIFF to prioritize logic if needed, but standard ASC works well for timelines.
    
    const [rows] = await db.execute(`
      SELECT * FROM AlterationRecords 
      WHERE status != 'Delivered' 
      ORDER BY date_of_delivery ASC
    `);

    // If you want delivered items too, remove the WHERE clause or handle via query param
    
    res.status(200).json({
      status: 'success',
      count: rows.length,
      data: rows
    });

  } catch (error) {
    next(error);
  }
};

// 3. Check Notifications (Due Next Day)
export const getAlterationNotifications = async (req, res, next) => {
  try {
    // Logic: 
    // Find items where date_of_delivery is TOMORROW (Current Date + 1 Day)
    // And status is NOT 'Ready' or 'Delivered' (meaning work is pending)
    
    const [rows] = await db.execute(`
      SELECT * FROM AlterationRecords 
      WHERE 
        date_of_delivery = CURDATE() + INTERVAL 1 DAY 
        AND status NOT IN ('Ready', 'Delivered')
    `);

    res.status(200).json({
      status: 'success',
      notification_count: rows.length,
      due_tomorrow: rows
    });

  } catch (error) {
    next(error);
  }
};

// 4. Update Status (Helper for 'Ready' or 'Delivered')
export const updateAlterationStatus = async (req, res, next) => {
  const alterationID = validID(req.params.alterationID);
  const { status, payment_status } = req.body;

  try {
    if (!alterationID) throw new AppError(400, "Invalid ID");

    // Dynamic update building
    const fields = [];
    const values = [];

    if (status) {
      fields.push("status = ?");
      values.push(status);
    }
    if (payment_status) {
      fields.push("payment_status = ?");
      values.push(payment_status);
    }

    if (fields.length === 0) throw new AppError(400, "No fields to update");

    values.push(alterationID); // For WHERE clause

    await db.execute(
      `UPDATE AlterationRecords SET ${fields.join(", ")} WHERE alterationID = ?`,
      values
    );

    res.status(200).json({ message: "Status updated" });

  } catch (error) {
    next(error);
  }
};

export const updateAlteration = async (req , res , next) => {
  const alterationID = validID(req.params.alterationID);
  
  const billNo = validString(req.body.bill_no);
  const slipNo = validString(req.body.slip_no);
  const customerName = validString(req.body.customer_name);
  // const contact = validString(req.body.contact, 10, 15);
  const dimensionText = validString(req.body.dimension_text, 0, 1000);
  const dateOfDelivery = req.body.date_of_delivery;
  const status = req.body.status;
  const amount = validDecimal(req.body.amount);
  const paymentStatus = req.body.payment_status;

  const dimensionImgPath = req.file ? req.file.path : null;
  let newCloudinaryID;
  let newImgUrl;

  try {
    if(!alterationID) throw new AppError(400 , "Invalid Alteration ID");

    const [[existing]] = await db.execute(
      `SELECT cloudinary_id FROM AlterationRecords WHERE alterationID = ? `, [alterationID] );
    
    if(!existing) throw new AppError(404 , "Alteration record not found");

    //handle image replacement
    if(dimensionImgPath){
      const uploadResult = await uploadOnCloudinary(dimensionImgPath);
      if(!uploadResult?.url) throw new AppError(500 , "Image upload failed");
      newImgUrl = uploadResult.url;
      newCloudinaryID = uploadResult.public_id;

      if(existing.cloudinary_id){
        await deleteFromCloudinary(existing.cloudinary_id);
      }
    }

    //dynamic update
    const fields = [];
    const values = [];

    if (billNo) fields.push("bill_no = ?"), values.push(billNo);
    if (slipNo) fields.push("slip_no = ?"), values.push(slipNo);
    if (customerName) fields.push("customer_name = ?"), values.push(customerName);
    // if (contact) fields.push("contact = ?"), values.push(contact);
    if (dimensionText !== undefined) fields.push("dimension_text = ?"), values.push(dimensionText);
    if (dateOfDelivery) fields.push("date_of_delivery = ?"), values.push(dateOfDelivery);
    if (status) fields.push("status = ?"), values.push(status);
    if (amount !== undefined) fields.push("amount = ?"), values.push(amount);
    if (paymentStatus) fields.push("payment_status = ?"), values.push(paymentStatus);

    if (newImgUrl){
      fields.push("dimension_image = ?", "cloudinary_id = ?");
      values.push(newImgUrl , newCloudinaryID);
    }
    if(fields.length === 0){
      throw new AppError(400 , "No fields provided to update");
    }
    values.push(alterationID);

    await db.execute(
      `UPDATE AlterationRecords SET ${fields.join(", ")} WHERE alterationID = ?`,
      values
    );
    res.status(200).json({
      message: "Alteration record updated successfully"
    });
  } catch (error) {
    if(newCloudinaryID){
      deleteFromCloudinary(newCloudinaryID).catch(err =>
        logger.warn(`Cloudinary cleaniup failed: ${err.message}`)
      );
    }
    next(error);
  }
  finally {
      if (dimensionImgPath) {
        deleteTempImg(dimensionImgPath).catch(err =>
        logger.warn(`Temp file deletion failed: ${err.message}`)
      );
    }
  }
};

// 6. Delete Alteration
export const deleteAlteration = async (req, res, next) => {
  const alterationID = validID(req.params.alterationID);

  try {
    if (!alterationID) throw new AppError(400, "Invalid Alteration ID");

    // Fetch existing record
    const [[record]] = await db.execute(
      `SELECT cloudinary_id FROM AlterationRecords WHERE alterationID = ?`,
      [alterationID]
    );

    if (!record) throw new AppError(404, "Alteration record not found");

    // Delete image from Cloudinary if exists
    if (record.cloudinary_id) {
      await deleteFromCloudinary(record.cloudinary_id);
    }

    // Delete DB record
    await db.execute(
      `DELETE FROM AlterationRecords WHERE alterationID = ?`,
      [alterationID]
    );

    res.status(200).json({
      message: "Alteration record deleted successfully"
    });

  } catch (error) {
    next(error);
  }
};
