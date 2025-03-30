import { db } from '../index.js'; 

// product controller 

const createProduct = async (req, res) => {
    const { name, description, stock } = req.body;
    try {
        const [result] = await db.execute(
            "INSERT INTO Products (name, description) VALUES (?, ?)", 
            [name, description]
        );
        res.status(201).json({ message: "Product created", productID: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateProduct = async (req, res) => {
    const { name, description } = req.body;

    try {
        const [result] = await db.execute(
            "UPDATE Products SET name=?, description=? WHERE productID=?", 
            [name, description,req.params.productID]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: "Product not found" });
        res.json({ message: "Product updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const rateProduct = async (req, res) => {
    const { rating } = req.body;
    const userID = req.user.id; 
    const productID = req.params.id;

    // Validate rating (must be 1-5)
    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    try {
        //  Check if user has purchased the product
        const [order] = await db.execute(
            "SELECT * FROM Orders WHERE userID = ? AND productID = ?",
            [userID, productID]
        );

        if (order.length === 0) {
            return res.status(403).json({ message: "You can only rate products you have purchased" });
        }

        // Check if the user has already rated this product for this order
        const [existingRating] = await db.execute(
            "SELECT * FROM Ratings WHERE userID = ? AND productID = ?",
            [userID, productID]
        );

        if (existingRating.length > 0) {
            return res.status(400).json({ message: "You have already rated this product. Purchase again to rate again." });
        }

        // Insert the new rating
        await db.execute(
            "INSERT INTO Ratings (userID, productID, rating) VALUES (?, ?, ?)",
            [userID, productID, rating]
        );

        // Update cumulative rating and people rated in Products table
        await db.execute(
            "UPDATE Products SET cumulative_rating = cumulative_rating + ?, people_rated = people_rated + 1 WHERE productID = ?",
            [rating, productID]
        );

        res.status(201).json({ message: "Rating submitted successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const getProductById = async (req, res) => {
    try {
        const [product] = await db.execute(
            "SELECT *, (cumulative_rating / NULLIF(people_rated, 0)) AS average_rating FROM Products WHERE productID = ?", 
            [req.params.productID]
        );

        if (product.length === 0) return res.status(404).json({ message: "Product not found" });

        res.json(product[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getAllProducts = async (req, res) => {
    try {
        const [products] = await db.execute("SELECT *, (cumulative_rating / NULLIF(people_rated, 0)) AS average_rating  FROM Products");
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const [result] = await db.execute("DELETE FROM Products WHERE productID=?", [req.params.productID]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Product not found" });
        res.json({ message: "Product deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



// Variant Controller 

const createVariant = async (req, res) => {
    const { color, size, price, discount, stock } = req.body;
    try {
        const [result] = await db.execute(
            "INSERT INTO ProductVariants (productID, color, size, price, discount, stock) VALUES (?, ?, ?, ?, ?, ?)", 
            [req.params.productID, color, size, price, discount, stock]
        );
        res.status(201).json({ message: "Variant created", variantID: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateVariant=  async (req, res) => {
    const { color, size, price, discount, stock } = req.body;
    try {
        const [result] = await db.execute(
            "UPDATE ProductVariants SET color=?, size=?, price=?, discount=?, stock=? WHERE variantID=?", 
            [color, size, price, discount, stock, req.params.variantID]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: "Variant not found" });
        res.json({ message: "Variant updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getVariantsByProduct = async (req, res) => {
    try {
        const [variants] = await db.execute("SELECT * FROM ProductVariants WHERE productID = ?", [req.params.productID]);
        res.json(variants);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const getVariantById = async (req, res) => {
    try {
        const [variant] = await db.execute("SELECT * FROM ProductVariants WHERE variantID = ?", [req.params.variantID]);
        res.json(variant);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteVariant = async (req, res) => {
    try {
        const [result] = await db.execute("DELETE FROM ProductVariants WHERE variantID=?", [req.params.variantID]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Variant not found" });
        res.json({ message: "Variant deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


export
{
 createProduct,
 updateProduct,
 rateProduct,
 getProductById,
 getAllProducts,
 deleteProduct,
 createVariant,
 updateVariant,
 getVariantsByProduct,
 getVariantById,
 deleteVariant

}