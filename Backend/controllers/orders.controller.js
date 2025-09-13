import { db } from '../index.js';
import { constants } from '../config/constants.js';
import { validID, validStringChar, validPhoneNumber } from '../utils/validators.utils.js';
import { ValidEAN13 } from '../utils/generateBarcode.js';
import AppError from "../errors/appError.js";


export const createOrder = async (req, res, next) => {
  const addressID = validID(req.body.addressID);
  const { payment_method } = req.body;
  const userID = req.userID;
  let conn;

  try {
    // Validate address Id
    if(addressID === null){
      throw new AppError(422, 'Invalid Address ID');
    }

    // Make connection for transaction
    conn = await db.getConnection();
    await conn.beginTransaction();

    // Checking if address exists and belongs to user
    const [addressRows] = await conn.execute(
      `SELECT * FROM Addresses WHERE addressID = ? AND userID = ?`,
      [addressID, userID]
    );

    if (addressRows.length === 0) {
      throw new AppError(400, 'Invalid address');
    }

    // Checking if payment method is valid
    if(!constants.PAYMENT_METHODS.includes(payment_method)){
      throw new AppError(400, 'Invalid payment method');
    }

    // Fetching cart items
    const [cartItems] = await conn.execute(
      `SELECT variantID, quantity FROM CartItems WHERE userID = ?`,
      [userID]
    );

    if (cartItems.length === 0) {
      throw new AppError(400, 'Cart is empty');
    }

    // Creating order
    const [orderResult] = await conn.execute(
      `INSERT INTO Orders (userID, addressID, payment_method, amount, order_location) 
       VALUES (?, ?, ?, ?, ?)`,
      [userID, addressID, payment_method, 0.1, constants.SHOP_LOCATION]
    );

    const orderID = orderResult.insertId;

    let amount = 0;

    // Inserting into OrderItems using items
    for (const item of cartItems) {
      // Getting price at time of purchase
      const [variantRow] = await conn.execute(`
        SELECT 
          variantID, 
          productID, 
          color, 
          size, 
          main_image, 
          price, 
          discount 
        FROM ProductVariants WHERE variantID = ?`,
        [item.variantID]
      );

      // Decrement stock by quantity
      await conn.execute(`
        UPDATE ProductVariants SET stock = stock - ? WHERE variantID = ?`,
        [item.quantity, item.variantID]
      );

      if (variantRow.length === 0) {
        throw new AppError(400, 'Invalid product variant given');
      }

      const [productRow] = await conn.execute(
        `SELECT name, category, tax FROM Products WHERE productID = ?`,
        [variantRow[0].productID]
      );

      const { price, discount } = variantRow[0];
      const discountedPrice = price - (price * (discount / 100));
      amount = amount + (discountedPrice * item.quantity);

      await conn.execute(`
        INSERT INTO OrderItems (
          orderID,
          variantID,
          name,
          category,
          tax,
          color,
          main_image,
          size,
          quantity,
          price_at_purchase
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderID, 
          variantRow[0].variantID, 
          productRow[0].name, 
          productRow[0].category, 
          productRow[0].tax,
          variantRow[0].color, 
          variantRow[0].main_image, 
          variantRow[0].size, 
          item.quantity, 
          discountedPrice
        ]
      );
    }

    // Set order amount
    await conn.execute(
      "UPDATE Orders SET amount = ? WHERE orderID = ?",
      [amount, orderID]
    );

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
    next(error);

  } finally {
    if (conn) conn.release(); // always release connection
  }
};


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
        addressID,
        payment_method, 
        payment_status, 
        amount,
        order_location, 
        order_status, 
        promo_discount
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userID, 1, payment_method, 'completed', 0.1, constants.SHOP_LOCATION, 'delivered', promo_discount]
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
    
    let amount = 0;

    // Inserting into OrderItems using items
    for (const item of items) {
      // Getting price at time of purchase
      const [variantRow] = await conn.execute(`
        SELECT 
          variantID, 
          productID, 
          color, 
          size, 
          main_image, 
          price, 
          discount 
        FROM ProductVariants WHERE barcode = ?`,
        [item.barcode]
      );

      // Decrement stock by quantity
      await conn.execute(`
        UPDATE ProductVariants SET stock = stock - ? WHERE barcode = ?`,
        [item.quantity, item.barcode]
      );

      if (variantRow.length === 0) {
        await conn.rollback();
        throw new AppError(400, 'Invalid product variant given');
      }

      const [productRow] = await conn.execute(
        `SELECT name, category, tax FROM Products WHERE productID = ?`,
        [variantRow[0].productID]
      );

      const { price, discount } = variantRow[0];
      const discountedPrice = price - (price * (discount / 100));
      amount = amount + (discountedPrice * item.quantity);

      await conn.execute(`
        INSERT INTO OrderItems (
          orderID,
          variantID,
          name,
          category,
          tax,
          color,
          main_image,
          size,
          quantity,
          price_at_purchase
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderID, 
          variantRow[0].variantID, 
          productRow[0].name, 
          productRow[0].category, 
          productRow[0].tax,
          variantRow[0].color, 
          variantRow[0].main_image, 
          variantRow[0].size, 
          item.quantity, 
          discountedPrice
        ]
      );
    }

    // Set order amount
    await conn.execute(
      "UPDATE Orders SET amount = ? WHERE orderID = ?",
      [amount, orderID]
    );

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


export const getOrder = async (req, res, next) => {
  const orderID = validID(req.params.orderID);

  try {
    if(orderID===null){
      throw new AppError(422, 'Invalid Order ID');
    }

    const [orderRows] = await db.execute(
      `SELECT o.*, a.city, a.state, a.pincode, a.address_line, u.name AS customer_name
       FROM Orders o
       JOIN Addresses a ON o.addressID = a.addressID
       JOIN Users u ON o.userID = u.userID
       WHERE o.orderID = ?`,
      [orderID]
    );

    if (orderRows.length === 0) {
      throw new AppError(404, "Order not found");
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
    next(error);
  }
};


export const getOrdersByUser = async (req, res, next) => {
  const userID = req.userID;

  try {
    const [orders] = await db.execute(
      `SELECT orderID, created_at, payment_method, payment_status, order_status, amount
       FROM Orders 
       WHERE userID = ? 
       ORDER BY created_at DESC`,
      [userID]
    );

    return res.status(200).json({
      message: 'User orders fetched successfully',
      orders 
    });

  } catch (error) {
    next(error);
  }
};


export const getAllOrders = async (req, res, next) => {
  try {
    const [orders] = await db.execute(`
      SELECT 
        o.orderID, 
        o.created_at, 
        o.payment_method, 
        o.payment_status, 
        o.order_status, 
        o.order_location,
        o.amount,
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
    next(error);
  }
};

