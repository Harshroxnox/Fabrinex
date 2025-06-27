import { db } from '../index.js';
import { constants } from '../config/constants.js';
const { ORDER_LOCATION } = constants;


const createOrder = async (req, res) => {

  const { addressID, payment_method } = req.body;
  const userID = req.userID;


  try {
    await db.beginTransaction();

    // Checking if address exists and belongs to user
    const [addressRows] = await db.execute(
      `SELECT * FROM Addresses WHERE addressID = ? AND userID = ?`,
      [addressID, userID]
    );

    if (addressRows.length === 0) {
      await db.rollback();
      return res.status(400).json({ message: 'Invalid address' });
    }

    // Fetching cart items
    const [cartItems] = await db.execute(
      `SELECT variantID, quantity FROM CartItems WHERE userID = ?`,
      [userID]
    );

    if (cartItems.length === 0) {
      await db.rollback();
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Creating order
    const [orderResult] = await db.execute(
      `INSERT INTO Orders (userID, addressID, payment_method, order_location) 
       VALUES (?, ?, ?, ?)`,
      [userID, addressID, payment_method, ORDER_LOCATION]
    );

    const orderID = orderResult.insertId;

    // Inserting into OrderItems using cart data
    for (const item of cartItems) {
      // getting price at time of purchase
      const [variantRow] = await db.execute(
        `SELECT price, discount FROM ProductVariants WHERE variantID = ?`,
        [item.variantID]
      );

      if (variantRow.length === 0) {
        await db.rollback();
        return res.status(400).json({ message: 'Invalid product variant in cart' });
      }

      const { price, discount } = variantRow[0];
      const discountedPrice = price - (price * (discount / 100));

      await db.execute(
        `INSERT INTO OrderItems (orderID, variantID, quantity, price_at_purchase)
         VALUES (?, ?, ?, ?)`,
        [orderID, item.variantID, item.quantity, discountedPrice]
      );
    }

    //Clearing the cart
    await db.execute(
      `DELETE FROM CartItems WHERE userID = ?`,
      [userID]
    );

    await db.commit();

    res.status(201).json({
      message: 'Order created successfully',
      orderID
    });

  } catch (err) {
    await db.rollback();
    console.error('Error creating order:', err);
    res.status(500).json({ message: 'Internal server error' });
  } 
};


 const getOrder = async (req, res) => {
  const { orderID } = req.params;

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
      return res.status(404).json({ message: "Order not found" });
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
      order: orderRows[0],
      items,
    });

  } catch (err) {
    console.error('Error fetching order:', err);
    return res.status(500).json({ message: "Internal server error" });
  }
};


 const getOrdersByUser = async (req, res) => {
  const { userID } = req.params;

  try {
    const [orders] = await db.execute(
      `SELECT orderID, created_at, payment_method, payment_status, order_status 
       FROM Orders 
       WHERE userID = ? 
       ORDER BY created_at DESC`,
      [userID]
    );

    return res.status(200).json({ orders });

  } catch (err) {
    console.error('Error fetching user orders:', err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const [orders] = await db.execute(
      `SELECT 
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
       ORDER BY o.created_at DESC`
    );

    return res.status(200).json({ orders });
  } catch (err) {
    console.error('Error fetching all orders:', err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { createOrder,getOrder,getOrdersByUser,getAllOrders }