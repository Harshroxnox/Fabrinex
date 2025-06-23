import { db } from '../index.js'; 

export const addPromotion = async (req, res) => {
    const { code, discount } = req.body;

    if(discount <= 0 || discount >= 100){
        return res.status(400).json({ error: "Discount must be between 0 and 100." });
    }

    try{
        await db.execute(
            "INSERT INTO Promotions (promotion_code, discount) VALUES (?, ?)",
            [code.trim(), discount]
        )
        
        res.status(200).json({ message: "Promotion code added" });
    }catch (error){
        res.status(500).json({ error: error.message });
    }
};

export const updatePromotion = async (req, res) => {
    const promotionID = req.params.promotionID;
    const { discount } = req.body;

    if(discount <= 0 || discount >= 100){
        return res.status(400).json({ error: "Discount must be between 0 and 100." });
    }

    try{
        const [result] = await db.execute(
            "UPDATE Promotions SET discount = ? WHERE promotionID = ?",
            [discount, promotionID]
        )

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Promotion not found." });
        }

        res.status(200).json({ message: "Promotion code updated" });
    }catch (error){
        res.status(500).json({ error: error.message });
    }
};

export const deletePromotion = async (req, res) => {
    const promotionID = req.params.promotionID;

    try{
        const [result] = await db.execute("DELETE FROM Promotions WHERE promotionID = ?", [promotionID]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Promotion not found." });
        }

        res.status(200).json({ message: "Promotion code deleted" });
    }catch (error){
        res.status(500).json({ error: error.message });
    }
};

export const getAllPromotions = async (req, res) => {
    try {
        const [promotions] = await db.execute("SELECT * FROM Promotions");
        res.json(promotions);
    } catch (error){
        res.status(500).json({ error: error.message });
    }
}
