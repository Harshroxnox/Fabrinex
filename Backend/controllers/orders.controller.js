import { db } from '../index.js';
import { constants } from '../config/constants.js';
import { validID, validString, validWholeNo } from '../utils/validators.utils.js';


export const createOrder = async (req, res) => {
  const { addressID, payment_method } = req.body;
  const userID = req.userID;
  //validate address Id
  if(validID(addressID)===null){
    return res.status(422).json({error:'Invalid Address ID'});
  }
  let conn;

  try {
    // Make connection for transaction
    conn = await db.getConnection();
    await conn.beginTransaction();

    // Checking if address exists and belongs to user
    const [addressRows] = await conn.execute(
      `SELECT * FROM Addresses WHERE addressID = ? AND userID = ?`,
      [addressID, userID]
    );

    if (addressRows.length === 0) {
      await conn.rollback();
      return res.status(400).json({ error: 'Invalid address' });
    }

    // Checking if payment method is valid
    if(!constants.PAYMENT_METHODS.includes(payment_method)){
      await conn.rollback();
      return res.status(400).json({ error: 'Invalid payment method' });
    }

    // Fetching cart items
    const [cartItems] = await conn.execute(
      `SELECT variantID, quantity FROM CartItems WHERE userID = ?`,
      [userID]
    );

    if (cartItems.length === 0) {
      await conn.rollback();
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Creating order
    const [orderResult] = await conn.execute(
      `INSERT INTO Orders (userID, addressID, payment_method, order_location) 
       VALUES (?, ?, ?, ?)`,
      [userID, addressID, payment_method, constants.SHOP_LOCATION]
    );

    const orderID = orderResult.insertId;

    // Inserting into OrderItems using cart data
    for (const item of cartItems) {
      // Getting price at time of purchase
      const [variantRow] = await conn.execute(
        `SELECT price, discount FROM ProductVariants WHERE variantID = ?`,
        [item.variantID]
      );

      if (variantRow.length === 0) {
        await conn.rollback();
        return res.status(400).json({ error: 'Invalid product variant in cart' });
      }

      const { price, discount } = variantRow[0];
      const discountedPrice = price - (price * (discount / 100));

      await conn.execute(
        `INSERT INTO OrderItems (orderID, variantID, quantity, price_at_purchase)
         VALUES (?, ?, ?, ?)`,
        [orderID, item.variantID, item.quantity, discountedPrice]
      );
    }

    // Clearing the cart
    await conn.execute(
      `DELETE FROM CartItems WHERE userID = ?`,
      [userID]
    );

    // Commit database changes
    await conn.commit();

    res.status(201).json({
      message: 'Order created successfully',
      orderID
    });

  } catch (error) {
    if (conn) await conn.rollback(); // rollback if failed
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Internal server error' });

  } finally {
    if (conn) conn.release(); // always release connection
  }
};


export const getOrder = async (req, res) => {
  const { orderID } = req.params;
  if(validID(orderID)===null){
    return res.status(422).json({error:'Invalid Order ID'});
  }
  try {
    const [orderRows] = await db.execute(
      `SELECT o.*, a.city, a.state, a.pincode, a.address_line, u.name AS customer_name
       FROM Orders o
       JOIN Addresses a ON o.addressID = a.addressID
       JOIN Users u ON o.userID = u.userID
       WHERE o.orderID = ?`,
      [orderID]
    );

    if (orderRows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const [items] = await db.execute(
      `SELECT oi.*, pv.color, pv.size, pv.price AS current_price, pv.main_image,
        p.name AS product_name
       FROM OrderItems oi
       JOIN ProductVariants pv ON oi.variantID = pv.variantID
       JOIN Products p ON pv.productID = p.productID
       WHERE oi.orderID = ?`,
      [orderID]
    );

    return res.status(200).json({
      message: 'Order fetched successfully',
      order: orderRows[0],
      items,
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


export const getOrdersByUser = async (req, res) => {
  const userID = req.userID;

  try {
    const [orders] = await db.execute(
      `SELECT orderID, created_at, payment_method, payment_status, order_status 
       FROM Orders 
       WHERE userID = ? 
       ORDER BY created_at DESC`,
      [userID]
    );

    return res.status(200).json({
      message: 'User orders fetched successfully',
      orders 
    });
    if (profilePicPath) {
      deleteTempImg(profilePicPath).catch((error) => {
        console.warn(`Failed to delete file ${profilePicPath}: ${error.message}`);
      });
    }
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


export const getAllOrders = async (req, res) => {
  try {
    const [orders] = await db.execute(`
      SELECT 
        o.orderID, 
        o.created_at, 
        o.payment_method, 
        o.payment_status, 
        o.order_status, 
        u.userID, 
        u.name AS customer_name, 
        u.email
      FROM Orders o
      JOIN Users u ON o.userID = u.userID
      ORDER BY o.created_at DESC
    `);

    return res.status(200).json({ 
      message: 'All orders fetched successfully',
      orders 
    });

  } catch (error) {
    console.error('Error fetching all orders:', error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

