import { db } from '../index.js';
import logger from '../utils/logger.js';
import { validID, validString, validDecimal, validWholeNo } from '../utils/validators.utils.js';

export const addPromotion = async (req, res) => {
  const { code, discount, usage_per_user, min_order_price, max_discount, is_active = true } = req.body;

  if (validString(code) === null) {
    res.status(400).json({ error: 'Code is not a valid string' })
  }
  if (validDecimal(discount) === null || discount < 0 || discount > 100) {
    res.status(400).json({ error: 'invalid discount' })
  }
  if (validWholeNo(usage_per_user) === null || usage_per_user == 0) {
    res.status(400).json({ error: 'Invalid usage allowed for user' })
  }
  if (validDecimal(min_order_price) === null || min_order_price < 0) {
    res.status(400).json({ error: 'Invalid minimum order price' })
  }
  if (validDecimal(max_discount) === null || max_discount < 0 || max_discount > 100) {
    res.status(400).json({ error: 'Invalid max discount' })
  }
  if (is_active != true || is_active != false) {
    res.status(400).json({ error: 'Invalid Active status given' })
  }

  try {
    await db.execute(
      `INSERT INTO Promotions 
        (promotion_code, discount, usage_per_user, min_order_price, max_discount, is_active) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        code,
        discount,
        usage_per_user,
        min_order_price,
        max_discount,
        is_active
      ]
    );

    res.status(201).json({ message: "Promotion code added" });
  } catch (error) {
    logger.error('Erroconsoler creating promotion:', error.message);

    // Check for duplicate code error (MySQL code 1062)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Promotion code already exists.' });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
};


export const updatePromotion = async (req, res) => {
  const promotionID = validID(req.params.promotionID);
  if (promotionID === null) {
    return res.status(400).json({ error: "Invalid promotionID" });
  }

  const {discount,usage_per_user,min_order_price,max_discount,is_active} = req.body;

  const fields = [];
  const values = [];

  // Validate and push only if present
  if (discount !== undefined) {
    const valid = validDecimal(discount);
    if (valid === null || valid <= 0 || valid >= 100) {
      return res.status(400).json({ error: 'Invalid discount (must be between 0 and 100).' });
    }
    fields.push("discount = ?");
    values.push(valid);
  }

  if (usage_per_user !== undefined) {
    const valid = validWholeNo(usage_per_user);
    if (valid === null || valid <= 0) {
      return res.status(400).json({ error: 'Invalid usage_per_user (must be positive integer).' });
    }
    fields.push("usage_per_user = ?");
    values.push(valid);
  }

  if (min_order_price !== undefined) {
    const valid = validDecimal(min_order_price);
    if (valid === null || valid < 0) {
      return res.status(400).json({ error: 'Invalid min_order_price.' });
    }
    fields.push("min_order_price = ?");
    values.push(valid);
  }

  if (max_discount !== undefined) {
    const valid = validDecimal(max_discount);
    if (valid === null || valid < 0 || valid > 100) {
      return res.status(400).json({ error: 'Invalid max_discount (0 to 100).' });
    }
    fields.push("max_discount = ?");
    values.push(valid);
  }

  if (is_active !== undefined) {
    if (typeof is_active !== "boolean") {
      return res.status(400).json({ error: 'Invalid is_active (must be boolean).' });
    }
    fields.push("is_active = ?");
    values.push(is_active);
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: "No valid fields provided for update." });
  }

  try {
    const [result] = await db.execute(
      `UPDATE Promotions SET ${fields.join(', ')} WHERE promotionID = ?`,
      [...values, promotionID]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Promotion not found." });
    }

    res.status(200).json({
      message: "Promotion updated successfully.",
      updatedFields: Object.fromEntries(fields.map((f, i) => [f.split(' = ')[0], values[i]]))
    });
  } catch (error) {
    logger.error('Error updating promotion:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deletePromotion = async (req, res) => {
  const promotionID = validID(req.params.promotionID);
  if (promotionID === null) {
    return res.status(400).json({ error: "Invalid promotionID." });
  }

  try {
    const [result] = await db.execute(
      "UPDATE Promotions SET is_active = false WHERE promotionID = ?",
      [promotionID]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Promotion not found." });
    }

    res.status(200).json({ message: "Promotion deactivated (soft deleted)." });
  } catch (error) {
    logger.error('Error deleting promotion:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllPromotions = async (req, res) => {
  try {
    const [promotions] = await db.execute(
      "SELECT * FROM Promotions WHERE is_active = true ORDER BY createdAt DESC"
    );

    res.status(200).json({
      message: "Fetched active promotions successfully",
      promotions
    });
  } catch (error) {
    logger.error('Error fetching all promotions:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
