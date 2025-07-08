import { db } from '../index.js';
import logger from '../utils/logger.js';
import { validID, validString, validDecimal, validWholeNo } from '../utils/validators.utils.js';

export const addPromotion = async (req, res) => {
  const { code, discount, usage_per_user, min_order_price, max_discount, is_active } = req.body;

  if (validString(code) === null) {
    return res.status(400).json({ error: 'Code is not a valid string' })
  }
  if (validWholeNo(discount) === null || discount <= 0 || discount > 100) {
    return res.status(400).json({ error: 'Invalid discount' })
  }
  if (validWholeNo(usage_per_user) === null || usage_per_user === 0) {
    return res.status(400).json({ error: 'Invalid usage allowed for user' })
  }
  if (validDecimal(min_order_price) === null || min_order_price < 0) {
    return res.status(400).json({ error: 'Invalid minimum order price' })
  }
  if (validDecimal(max_discount) === null || max_discount < 0 ) {
    return res.status(400).json({ error: 'Invalid max discount' })
  }
  if (typeof is_active !== 'boolean') {
    return res.status(400).json({ error: 'Invalid Active status given' });
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

    return res.status(201).json({ message: "Promotion code added" });

  } catch (error) {
    logger.error('Erroconsoler creating promotion:', error.message);

    // Check for duplicate code error (MySQL code 1062)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Promotion code already exists.' });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
};


export const updatePromotion = async (req, res) => {
  const promotionID = validID(req.params.promotionID);
  if (promotionID === null) {
    return res.status(400).json({ error: "Invalid promotionID" });
  }

  const { discount, usage_per_user, min_order_price, max_discount, is_active } = req.body;

  const fields = [];
  const values = [];

  // Validate and push only if present
  if (discount !== undefined) {
    const valid = validWholeNo(discount);
    if (valid === null || valid <= 0 || valid > 100) {
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
    if (valid === null || valid < 0) {
      return res.status(400).json({ error: 'Invalid max_discount.' });
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
    return res.status(500).json({ error: 'Internal server error' });
  }
};

//As Such no need of this controller 
export const deactivatePromotion = async (req, res) => {
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
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllPromotions = async (req, res) => {
  try {
    const [promotions] = await db.execute(
      "SELECT * FROM Promotions  ORDER BY created_at DESC"
    );

    return res.status(200).json({
      message: "Fetched active promotions successfully",
      promotions
    });
  } catch (error) {
    logger.error('Error fetching all promotions:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const applyPromotions = async (req, res) => {

  const userID = req.userID;
  const orderID = validID(req.params.orderID);
  const promoCode = req.body.code;

  if (orderID === null) {
    return res.status(400).json({ error: 'Invalid orderID' });
  }

  if (validString(promoCode) === null) {
    return res.status(400).json({ error: 'Promocode is not a valid string' });
  }

  try {
    // Get promotionID and other details using promoCode
    const [promoRows] = await db.execute(
      `SELECT promotionID, discount, max_discount, min_order_price, usage_per_user, is_active 
       FROM Promotions WHERE promotion_code = ?`,
      [promoCode]
    );

    if (promoRows.length === 0 || !promoRows[0].is_active) {
      return res.status(400).json({ error: "Invalid or inactive promotion." });
    }

    const promo = promoRows[0];
    const promotionID = promo.promotionID;
  

    // Get Order Total
    const [orderTotalRows] = await db.execute(
      `SELECT SUM(price_at_purchase * quantity) AS orderTotal 
       FROM OrderItems WHERE orderID = ?`,
      [orderID]
    );

    const orderTotal = Number(orderTotalRows[0]?.orderTotal ?? 0);

    
    if (orderTotal < promo.min_order_price) {
      console.log(promo.min_order_price)
      console.log(orderTotal)
      return res.status(400).json({ error: "Order total below minimum for this promotion." });
    }

    // Check user's usage of the promotion
    const [usageRows] = await db.execute(
      `SELECT times_used FROM PromotionUsage 
       WHERE userID = ? AND promotionID = ?`,
      [userID, promotionID]
    );

    const timesUsed = usageRows[0]?.times_used ?? 0;

    if (timesUsed >= promo.usage_per_user) {
      return res.status(400).json({ error: "Promotion usage limit reached for this user." });
    }

    // Calculate final discount percentage to apply
    const discountAmount = (promo.discount / 100) * orderTotal;
    let finalDiscountPercentage;

    if (discountAmount <= promo.max_discount) {
      finalDiscountPercentage = promo.discount;
    } else {
      finalDiscountPercentage = (promo.max_discount / orderTotal) * 100;
      finalDiscountPercentage = Number(finalDiscountPercentage.toFixed(2));
    }

    // Update Orders table with discount
    await db.execute(
      `UPDATE Orders SET promo_discount = ? WHERE orderID = ?`,
      [finalDiscountPercentage, orderID]
    );

    // Update PromotionUsage
    if (timesUsed === 0) {
      await db.execute(
        `INSERT INTO PromotionUsage (userID, promotionID, times_used) VALUES (?, ?, 1)`,
        [userID, promotionID]
      );
    } else {
      await db.execute(
        `UPDATE PromotionUsage SET times_used = times_used + 1 
         WHERE userID = ? AND promotionID = ?`,
        [userID, promotionID]
      );
    }

    return res.status(200).json({
      message: "Promotion applied successfully.",
      appliedDiscountPercent: finalDiscountPercentage,
      orderTotal: Number(orderTotal.toFixed(2))
    });

  } catch (error) {
    logger.error("Error applying promotion:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};



