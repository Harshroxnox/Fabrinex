import { db } from '../index.js';
import { constants } from '../config/constants.js';
import { validID, validString, validWholeNo, validStringChar, validPhoneNumber } from '../utils/validators.utils.js';
import { ValidEAN13 } from '../utils/generateBarcode.js';
import AppError from "../errors/appError.js";


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

// TODO: Add SalespersonID to this route 
export const createOrderOffline = async (req, res, next) => {
  let name = req.body.name;
  let phone_number = req.body.phone_number;
  let salesPersonID = req.body.salesPersonID;
  let loyalty_barcode = ValidEAN13(req.body.loyalty_barcode);
  const payment_method = validStringChar(req.body.payment_method);
  const items = req.body.items;

  let conn;

  try {
    // Validations
    const NoNameOrPhone = (name === null || name === undefined || name === "") && 
    (phone_number === null || phone_number === undefined || phone_number === "");
    const barcodeGiven = loyalty_barcode!==null && loyalty_barcode!==undefined && loyalty_barcode!=="";
    const salespersonGiven = salesPersonID!==null && salesPersonID!==undefined && salesPersonID!=="";

    // Skip Phone and Name validation if both are not provided
    if(!NoNameOrPhone){
      name = validStringChar(name);
      if(name === null){
        throw new AppError(400, "Invalid Name");
      }

      phone_number = validPhoneNumber(phone_number);
      if(phone_number === null){
        throw new AppError(400, "Invalid Phone Number");
      }
    }

    // Checking if payment method is valid
    if(!constants.PAYMENT_METHODS.includes(payment_method)){
      throw new AppError(400, "Invalid payment method");
    }

    if(barcodeGiven){
      loyalty_barcode = ValidEAN13(loyalty_barcode);
      if(loyalty_barcode === null){
        throw new AppError(400, "Invalid Barcode");
      }
    }

    if(salesPersonID){
      salesPersonID = validID(salesPersonID);
      if(salesPersonID === null){
        throw new AppError(400, "Invalid salesPersonID");
      }
    }

    if(!Array.isArray(items) || items.length === 0){
      throw new AppError(400, "Invalid variants provided");
    }

    // Make connection for transaction
    conn = await db.getConnection();
    await conn.beginTransaction();

    // Fetch UserID
    let userID = 1;

    // If customer info given then update userID
    // If user already exists fetch that userID
    // If user does not exist create a new user and use that userID
    if(!NoNameOrPhone){
      const [user] = await conn.execute(
        `SELECT userID FROM Users WHERE phone_number = ?`,
        [phone_number]
      );
      if(user.length > 0){
        userID = user[0].userID;
      }else{
        const [userResult] = await conn.execute(
          `INSERT INTO Users (
            name, 
            phone_number, 
            whatsapp_number, 
            password, 
            razorpay_customer_id, 
            is_offline
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [name, phone_number, '+910000000000', 'guest', 'guest_customer_id', true]
        );
        userID = userResult.insertId;
      }
    }

    // Apply loyalty card if given
    let promo_discount = 0;
    if(barcodeGiven){
      const [barcodeRow] = await conn.execute(
        `SELECT discount FROM LoyaltyCards WHERE barcode = ?`,
        [loyalty_barcode]
      );

      if(barcodeRow.length === 0){
        throw new AppError(404, "Given Loyalty Card does not exist");
      }

      promo_discount = barcodeRow[0].discount;

      // After applying remove
      await conn.execute(
        `DELETE FROM LoyaltyCards WHERE barcode = ?`,
        [loyalty_barcode]
      );
    }

    // Creating order
    const [orderResult] = await conn.execute(
      `INSERT INTO Orders (
        userID, 
        payment_method, 
        payment_status, 
        order_location, 
        order_status, 
        promo_discount
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [userID, payment_method, 'completed', constants.SHOP_LOCATION, 'delivered', promo_discount]
    );

    const orderID = orderResult.insertId;

    // Add Salesperson if given
    if(salespersonGiven){
      const [salespersonResult] = await conn.execute(
        `SELECT commission FROM SalesPersons WHERE salesPersonID = ?`,
        [salesPersonID]
      );

      if(salespersonResult.length === 0){
        throw new AppError(404, "Salesperson Not Found");
      }
      const commission = salespersonResult[0].commission;

      await conn.execute(
        `INSERT INTO SalesPersonOrders (orderID, salesPersonID, commission) VALUES (?, ?, ?)`,
        [orderID, salesPersonID, commission]
      );
    }

    // Inserting into OrderItems using items
    for (const item of items) {
      // Getting price at time of purchase
      const [variantRow] = await conn.execute(
        `SELECT price, discount FROM ProductVariants WHERE variantID = ?`,
        [item.variantID]
      );

      if (variantRow.length === 0) {
        await conn.rollback();
        throw new AppError(400, 'Invalid product variant given');
      }

      const { price, discount } = variantRow[0];
      const discountedPrice = price - (price * (discount / 100));

      await conn.execute(
        `INSERT INTO OrderItems (orderID, variantID, quantity, price_at_purchase)
         VALUES (?, ?, ?, ?)`,
        [orderID, item.variantID, item.quantity, discountedPrice]
      );
    }

    // Commit database changes
    await conn.commit();

    res.status(201).json({
      message: 'Order created successfully',
      orderID
    });

  } catch (error) {
    if (conn) await conn.rollback(); // rollback if failed
    next(error);

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

