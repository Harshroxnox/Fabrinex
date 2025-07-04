# Backend 
Ensure that mysql and redis is properly installed. <br>
Run this command inside the backend folder. This creates the database with all the required tables.<br>
```bash
sudo mysql -u root -p < ./commands.sql
```

To delete the database run this command inside `mysql`<br>
```sql
drop database ecommerce;
```

To install the dependencies of backend run this inside backend folder<br>
```bash
npm install
```

To start the server inside Backend run<br>
```bash
npm start
```

Controller function format of backend<br>
```js
export const controllerFunc = async (req, res) => {
  // ✅ Extract inputs
  const userID = req.userID; // Typically set by auth middleware
  const { name, category } = req.body;
  const { id } = req.params;

  // ✅ Validate inputs
  // check if category is valid
  if (!constants.PRODUCT_CATEGORIES.includes(category)) {
    return res.status(400).json({
      error: `Invalid category. Must be one of: ${constants.PRODUCT_CATEGORIES.join(', ')}`,
    });
  }
  
  try {
    // ✅ Database logic
    const [users] = await db.execute("SELECT name, email, phone_number FROM Users");

    // ✅ Send successful response
    res.status(200).json({
      message: "All users fetched successfully",
      users: users 
    });
  } catch (error) {
    // ✅ Error logging & response
    console.error("Error fetching Users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
```

Transaction controller function example<br>
```js
export const verifySavedCardPayment = async (req, res) => {
  const {
    razorpay_payment_id,
    orderID
  } = req.body;
  // Make this connection connection global variable
  let conn;

  try {
    // Using transactions to ensure consistency in database (either both gets executed or none)
    conn = await db.getConnection(); // make connection
    await conn.beginTransaction(); // begin transaction

    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    const amount = parseFloat((payment.amount / 100).toFixed(2));
    const payment_method = payment.method;

    if (payment.status !== 'captured') {
      return res.status(400).json({ error: `Payment not captured. Status: ${payment.status}` });
    }

    if (payment_method !== 'card') {
      return res.status(400).json({ error: `Payment method is not card. Method: ${payment_method}` });
    }

    await conn.execute(
      `INSERT INTO Transactions (orderID, razorpay_payment_id, amount) VALUES (?, ?, ?)`,
      [orderID, razorpay_payment_id, amount]
    );
    await conn.execute(
      `UPDATE Orders SET payment_status = 'completed', payment_method = 'card' WHERE orderID = ?`,
      [orderID]
    );

    // commit database changes only if both got executed successfully
    await conn.commit();
    res.status(200).json({ message: "Successfully verified!" });

  } catch (error) {
    // rollback database changes on error
    if (conn) await conn.rollback();
    console.error('Error verifying saved card payment:', error);
    res.status(500).json({ error: 'Internal server error' });

  } finally {
    if (conn) conn.release(); // finally release connection
  }
};
```

Update database and Delete from cloudinary `fire and forget` and `non-blocking` example<br>
```js
export const deleteVariant = async (req, res) => {
  const variantID = req.params.variantID;
  try {
    const [variants] = await db.execute(
      `SELECT cloudinary_id FROM ProductVariants WHERE variantID = ?`,
      [variantID]
    );

    // If variant not found return 
    if (variants.length === 0) {
      return res.status(404).json({ error: 'Variant not found' });
    }

    // Extracting secondary images cloudinaryIDs
    const [secondaryImgs] = await db.execute(
      `SELECT cloudinary_id FROM VariantImages WHERE variantID = ?`,
      [variantID]
    );

    let cloudinaryID = variants[0].cloudinary_id;

    await db.execute("DELETE FROM ProductVariants WHERE variantID=?", [variantID]);
    // Early response before deleting cloudinary images so that the client does not
    // need to wait for the deletion of all cloudinary images and any error in those does
    // not affect response
    res.status(200).json({ message: "Variant deleted successfully" });

    // Delete main image and secondary images from Cloudinary
    // Fire and forget, non blocking, does not affect response, does not use await
    deleteFromCloudinary(cloudinaryID);
    secondaryImgs.forEach((image)=> deleteFromCloudinary(image.cloudinary_id));
    
  } catch (error) {
    console.error('Error deleting variant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```
