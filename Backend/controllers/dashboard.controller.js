import { db } from '../index.js';
import { validID, validBoolean, validWholeNo, validString, validURL } from '../utils/validators.utils.js';
import AppError from '../errors/appError.js';


export const getMetrics = async (req, res, next) => {
  try {
    return res.status(200).json({ message: "Hello World" });    

  } catch (error) {
    next(error);
  }
};

export const getBestSellingPricePerVariant = async (req, res, next) => {
  try {
    const [rows] = await db.execute(`
      SELECT t.variantID, 
       p.name, 
       v.size, 
       v.color, 
       t.price_at_purchase, 
       t.total_sold
      FROM (
          SELECT 
              variantID,
              price_at_purchase,
              SUM(quantity) AS total_sold,
              ROW_NUMBER() OVER (PARTITION BY variantID ORDER BY SUM(quantity) DESC) AS rn
          FROM OrderItems
          GROUP BY variantID, price_at_purchase
      ) t
      JOIN ProductVariants v ON v.variantID = t.variantID
      JOIN Products p ON p.productID = v.productID
      WHERE t.rn = 1;
    `);
    res.status(200).json({
      message: "Best selling price per variant fetched successfully",
      data: rows,
    });
  } catch (error) {
    next(error);
  }
}