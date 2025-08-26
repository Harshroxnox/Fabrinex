import { db } from "../index.js";
import { generateUniqueBarcode } from "../utils/generateBarcode.js";
import { validWholeNo } from "../utils/validators.utils.js";

export const createLoyaltyCard = async (req, res, next) => {
  try {
    console.log(req.body.discount);
    const discount = validWholeNo(req.body.discount);
    if(discount == null || discount < 0 || discount > 100) {
      return res.status(400).json({ message: "Invalid discount value" });
    }
    const barcode = await generateUniqueBarcode("LoyaltyCards");
    const [result] = await db.query(
      "INSERT INTO LoyaltyCards (discount, barcode) VALUES (?, ?)",
      [discount, barcode]
    );

    res.status(201).json({ 
        message: "Loyalty card created successfully", 
        cardID: result.insertId 
      });
  } catch (error) {
    next(error);
  }
};

export const deleteLoyaltyCard = async (req, res, next) => {

    try {
        const barcode = req.params.barcode;
        const [result] = await db.query(
            "DELETE FROM LoyaltyCards WHERE barcode = ?",
            [barcode]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Loyalty card not found" });
        }
        res.status(200).json({ message: "Loyalty card deleted successfully" });
    } catch (error) {
        next(error);
    }
}
export const getLoyaltyCards = async (req, res, next) => {
    try {
        const [loyaltyCards] = await db.execute(`
            SELECT
            l.loyaltyCardID,
            l.discount,
            l.barcode,
            l.created_At
            FROM
            LoyaltyCards l
            ORDER BY l.created_At DESC`);

        //get the count of total no. of loyalty cards
        const [count] = await db.execute(`
            SELECT COUNT(*) AS count
            FROM LoyaltyCards
        `);
        res.status(200).json({
            message:"All loyalty cards are fetched successfully",
            total: count[0].count,
            loyaltyCards
        })
    } catch (error) {
        next(error);
    }
}