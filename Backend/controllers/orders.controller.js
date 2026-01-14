import { db } from '../index.js';
import { constants } from '../config/constants.js';
import { validID, validStringChar, validPhoneNumber, validDate, validDecimal } from '../utils/validators.utils.js';
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
      `INSERT INTO Orders (userID, addressID, payment_method, amount, profit, tax, order_location) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userID, addressID, payment_method, 0.1, 0.1, 0.1, constants.SHOP_LOCATION]
    );

    const orderID = orderResult.insertId;

    let amount = 0;
    let profit = 0;
    let tax = 0;

    // Inserting into OrderItems using items
    for (const item of cartItems) {
      // Getting price at time of purchase
      const [variantRow] = await conn.execute(`
        SELECT 
          variantID, 
          productID, 
          color, 
          size,
          my_wallet, 
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

      const productTax  = productRow[0].tax;
      const { price, discount } = variantRow[0];
      // applied variant discount 
      const actualPrice = price - (price * (discount / 100));
      // applied tax 
      const taxedPrice = actualPrice + (actualPrice * (productTax/100));

      amount = amount + (taxedPrice * item.quantity);
      profit = profit + (actualPrice - variantRow[0].my_wallet) * item.quantity;
      tax = tax + actualPrice * (productTax/100) * item.quantity;

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
          actualPrice
        ]
      );
    }

    // Set order amount, profit, tax
    await conn.execute(
      "UPDATE Orders SET amount = ?, profit = ?, tax = ? WHERE orderID = ?",
      [amount, profit, tax, orderID]
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
  let {
    name,
    phone_number,
    salesPersonID,
    loyalty_barcode,
    payment_method,
    items,
    payments
  } = req.body;

  let conn;

  try {
    payment_method = validStringChar(payment_method);
    loyalty_barcode = ValidEAN13(loyalty_barcode);

    const NoNameOrPhone =
      (!name || name === "") &&
      (!phone_number || phone_number === "");

    const barcodeGiven = !!loyalty_barcode;
    const salespersonGiven = !!salesPersonID;

    if (!constants.PAYMENT_METHODS.includes(payment_method)) {
      throw new AppError(400, "Invalid payment method");
    }

    if (!Array.isArray(items) || items.length === 0) {
      throw new AppError(400, "Invalid variants provided");
    }

    if (!NoNameOrPhone) {
      name = validStringChar(name);
      phone_number = validPhoneNumber(phone_number);

      if (!name) throw new AppError(400, "Invalid Name");
      if (!phone_number) throw new AppError(400, "Invalid Phone Number");
    }

    if (salespersonGiven) {
      salesPersonID = validID(salesPersonID);
      if (!salesPersonID) throw new AppError(400, "Invalid salesPersonID");
    }

    conn = await db.getConnection();
    await conn.beginTransaction();

    /* ---------------- USER ---------------- */
    let userID = 1;

    if (!NoNameOrPhone) {
      const [user] = await conn.execute(
        `SELECT userID FROM Users WHERE phone_number = ?`,
        [phone_number]
      );

      if (user.length) {
        userID = user[0].userID;
      } else {
        const [createdUser] = await conn.execute(
          `INSERT INTO Users 
           (name, phone_number, whatsapp_number, password, razorpay_customer_id, is_offline)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [name, phone_number, '+910000000000', 'guest', 'guest_customer_id', true]
        );
        userID = createdUser.insertId;
      }
    }

    /* ---------------- LOYALTY ---------------- */
    let promo_discount = 0;
    if (barcodeGiven) {
      const [row] = await conn.execute(
        `SELECT discount FROM LoyaltyCards WHERE barcode = ?`,
        [loyalty_barcode]
      );
      if (!row.length) throw new AppError(404, "Loyalty Card not found");
      promo_discount = row[0].discount;
    }

    /* ---------------- CREATE ORDER ---------------- */
    const [orderRes] = await conn.execute(
      `INSERT INTO Orders 
       (userID, addressID, payment_method, payment_status, amount, profit, tax, order_location, order_status, promo_discount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userID, 1, payment_method, 'completed', 0.1, 0.1, 0.1, constants.SHOP_LOCATION, 'delivered', promo_discount]
    );

    const orderID = orderRes.insertId;

    /* ---------------- SALESPERSON ---------------- */
    if (salespersonGiven) {
      const [sp] = await conn.execute(
        `SELECT commission FROM SalesPersons WHERE salesPersonID = ?`,
        [salesPersonID]
      );
      if (!sp.length) throw new AppError(404, "Salesperson Not Found");

      await conn.execute(
        `INSERT INTO SalesPersonOrders (orderID, salesPersonID, commission)
         VALUES (?, ?, ?)`,
        [orderID, salesPersonID, sp[0].commission]
      );
    }

    /* ---------------- ITEMS ---------------- */
    let amount = 0;
    let profit = 0;
    let tax = 0;

    for (const item of items) {
      const [variant] = await conn.execute(
        `SELECT variantID, productID, color, size, my_wallet, main_image, price, discount, stock
         FROM ProductVariants WHERE barcode = ?`,
        [item.barcode]
      );

      if (!variant.length || variant[0].stock < item.quantity) {
        throw new AppError(400, "Insufficient stock");
      }

      const [product] = await conn.execute(
        `SELECT name, category, tax FROM Products WHERE productID = ?`,
        [variant[0].productID]
      );

      const basePrice = variant[0].price;
      const actualPrice = basePrice - (basePrice * variant[0].discount) / 100;
      const afterPromo = actualPrice - (actualPrice * promo_discount) / 100;
      const taxAmount = (afterPromo * product[0].tax) / 100;
      const finalPrice = afterPromo + taxAmount;

      amount += finalPrice * item.quantity;
      profit += (afterPromo - variant[0].my_wallet) * item.quantity;
      tax += taxAmount * item.quantity;

      await conn.execute(
        `UPDATE ProductVariants SET stock = stock - ? 
         WHERE barcode = ? AND stock >= ?`,
        [item.quantity, item.barcode, item.quantity]
      );

      await conn.execute(
        `INSERT INTO OrderItems
         (orderID, variantID, name, category, tax, color, main_image, size, quantity, price_at_purchase)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderID,
          variant[0].variantID,
          product[0].name,
          product[0].category,
          product[0].tax,
          variant[0].color,
          variant[0].main_image,
          variant[0].size,
          item.quantity,
          actualPrice
        ]
      );
    }

    amount = Number(amount.toFixed(2));
    profit = Number(profit.toFixed(2));
    tax = Number(tax.toFixed(2));

    await conn.execute(
      `UPDATE Orders SET amount = ?, profit = ?, tax = ? WHERE orderID = ?`,
      [amount, profit, tax, orderID]
    );

    /* ---------------- PAYMENTS ---------------- */
    let cashAmount = 0;
    let onlineAmount = 0;
    let onlineMethod = null;

    if (payment_method === "cash") {
      cashAmount = amount;
    }

    if (constants.ONLINE_PAYMENT_METHODS.includes(payment_method)) {
      onlineAmount = amount;
      onlineMethod = payment_method;
    }

    if (payment_method === "split") {
      if (!payments?.cash || !payments?.online)
        throw new AppError(400, "Split payment requires cash and online");

      cashAmount = Number(payments.cash);
      onlineAmount = Number(payments.online.amount);
      onlineMethod = payments.online.method;

      if (!constants.ONLINE_PAYMENT_METHODS.includes(onlineMethod))
        throw new AppError(400, "Invalid online payment method");

      if (Math.abs(cashAmount + onlineAmount - amount) > 0.01)
        throw new AppError(400, "Payment total mismatch");
    }

    if (cashAmount > 0) {
      await conn.execute(
        `INSERT INTO OrderPayments (orderID, type, amount)
         VALUES (?, 'cash', ?)`,
        [orderID, cashAmount]
      );
    }

    if (onlineAmount > 0) {
      await conn.execute(
        `INSERT INTO OrderPayments (orderID, type, method, amount)
         VALUES (?, 'online', ?, ?)`,
        [orderID, onlineMethod, onlineAmount]
      );
    }

    await conn.commit();

    res.status(201).json({
      message: "Order created successfully",
      orderID
    });

  } catch (err) {
    if (conn) await conn.rollback();
    next(err);
  } finally {
    if (conn) conn.release();
  }
};


export const updateOrderOffline = async (req, res, next) => {
  // Get orderID from URL parameters
  const orderID = validID(req.params.orderID);

  // items will be an array like:
  // [ { "variantID": "uuid-abc", "quantity": -1 }, // A return
  //   { "variantID": "uuid-xyz", "quantity": 1 } ]  // An exchange
  const { items } = req.body;
  let conn;

  try {
    // === 1. VALIDATIONS ===
    if (orderID === null) {
      throw new AppError(422, 'Invalid Order ID');
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new AppError(400, 'Items array is required for update');
    }

    // Make connection for transaction
    conn = await db.getConnection();
    await conn.beginTransaction();

    // === 2. FETCH ORIGINAL ORDER ===
    const [orderRows] = await conn.execute(
      `SELECT * FROM Orders WHERE orderID = ?`,
      [orderID]
    );

    if (orderRows.length === 0) {
      throw new AppError(404, 'Order not found');
    }

    // Store original values to apply the net change later
    const originalOrder = orderRows[0];
    const promo_discount = parseFloat(originalOrder.promo_discount);
    let netAmountChange = 0;
    let netProfitChange = 0;
    let netTaxChange = 0;

    // === 3. PROCESS EACH RETURN/EXCHANGE ITEM ===
    for (const item of items) {
      const { variantID, quantity } = item;

      if (!variantID || typeof quantity !== 'number' || quantity === 0) {
        throw new AppError(400, 'Invalid item data. Each item must have a variantID and a non-zero quantity.');
      }

      // Getting price and product info at time of exchange
      const [variantRow] = await conn.execute(`
        SELECT 
          pv.variantID, pv.productID, pv.color, pv.size, pv.my_wallet, 
          pv.main_image, pv.price, pv.discount, pv.stock,
          p.name, p.category, p.tax
        FROM ProductVariants AS pv
        JOIN Products AS p ON pv.productID = p.productID
        WHERE pv.variantID = ?`,
        [variantID]
      );

      if (variantRow.length === 0) {
        throw new AppError(400, `Invalid product variantID: ${variantID}`);
      }

      const variant = variantRow[0];

      // === 4. STOCK MANAGEMENT ===
      
      // If quantity is positive (exchange), check if stock is available
      // *** FIX: Ensure stock is also treated as a number for comparison ***
      if (quantity > 0 && parseFloat(variant.stock) < quantity) {
        throw new AppError(400, `Not enough stock for ${variant.name} (${variant.size}, ${variant.color}). Required: ${quantity}, Available: ${variant.stock}`);
      }

      // Update stock:
      await conn.execute(
        `UPDATE ProductVariants SET stock = stock - ? WHERE variantID = ?`,
        [quantity, variantID]
      );

      // === 5. CALCULATE FINANCIALS FOR THIS ITEM ===
      const productTax = parseFloat(variant.tax);
      const price = parseFloat(variant.price);
      const discount = parseFloat(variant.discount);
      const my_wallet = parseFloat(variant.my_wallet);

      // applied variant discount 
      const actualPrice = price - (price * (discount / 100));
      // applied promo discount if any
      const discountedPrice = actualPrice - (actualPrice * (promo_discount / 100));
      // applied tax 
      const taxedPrice = discountedPrice + (discountedPrice * (productTax/100));

      // Add this item's financial impact to the net change
      netAmountChange += (taxedPrice * quantity);
      netProfitChange += (discountedPrice - my_wallet) * quantity;
      netTaxChange += (discountedPrice * (productTax/100)) * quantity;

      // === 6. INSERT ADJUSTMENT INTO OrderItems ===
      await conn.execute(`
        INSERT INTO OrderItems (
          orderID, variantID, name, category, tax, color, 
          main_image, size, quantity, price_at_purchase
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderID,
          variant.variantID,
          variant.name,
          variant.category,
          variant.tax, // Storing the original string is fine
          variant.color,
          variant.main_image,
          variant.size,
          quantity, // This will be negative for returns
          actualPrice
        ]
      );
    }

    // === 7. UPDATE THE MAIN ORDER WITH NET CHANGES ===
    const finalAmount = parseFloat(originalOrder.amount) + netAmountChange;
    const finalProfit = parseFloat(originalOrder.profit) + netProfitChange;
    const finalTax = parseFloat(originalOrder.tax) + netTaxChange;

    await conn.execute(
      "UPDATE Orders SET amount = ?, profit = ?, tax = ? WHERE orderID = ?",
      [finalAmount, finalProfit, finalTax, orderID]
    );

    // Commit database changes
    await conn.commit();

    // === 8. RESPOND WITH BALANCE INFORMATION ===
    let balanceMessage = '';
    if (netAmountChange < 0) {
      balanceMessage = `Refund due to customer: ${Math.abs(netAmountChange).toFixed(2)}`;
    } else if (netAmountChange > 0) {
      balanceMessage = `Additional charge required: ${netAmountChange.toFixed(2)}`;
    } else {
      balanceMessage = 'Even exchange, no balance change.';
    }

    res.status(200).json({
      message: 'Order updated successfully',
      orderID,
      balanceInfo: balanceMessage,
      netAmountChange: netAmountChange.toFixed(2)
    });

  } catch (error) {
    if (conn) await conn.rollback(); // rollback if failed
    next(error);

  } finally {
    if (conn) conn.release(); // always release connection
  }
};

export const getSingleOrder = async (req, res, next) => {
  const orderID = validID(req.params.orderID);
  let conn;

  try {
    if (orderID === null) {
      throw new AppError(422, 'Invalid Order ID');
    }

    conn = await db.getConnection();

    // 1. Get the main order details
    const [orderRows] = await conn.execute(
      `SELECT * FROM Orders WHERE orderID = ?`,
      [orderID]
    );

    if (orderRows.length === 0) {
      throw new AppError(404, 'Order not found');
    }

    // 2. Get ALL items (original, returns, exchanges)
    // We order by the primary key to get them in chronological order
    const [items] = await conn.execute(
      `SELECT * FROM OrderItems WHERE orderID = ? ORDER BY orderItemID ASC`,
      [orderID]
    );

    const order = orderRows[0];
    // Attach the full item history to the order object
    order.items = items; 

    res.status(200).json({
      message: 'Order details fetched successfully',
      order
    });

  } catch (error) {
    next(error);
  } finally {
    if (conn) conn.release();
  }
};

export const filter = async (req, res, next) => {
  try {
    // NOTE: Date format must be YYYY-MM-DD
    let {
      date_from,
      date_to,
      order_status,
      payment_status,
      payment_method,
      amount_from,
      amount_to,
    } = req.query;


    let sql = `SELECT 
        o.*, 
        u.name AS customer_name 
      FROM 
        Orders AS o 
      LEFT JOIN 
        Users AS u ON o.userID = u.userID 
      WHERE 
        1=1
    `;
    const params = [];

    if(date_from){
      date_from = validDate(date_from);
      if(date_from === null){
        throw new AppError(400, "Invalid Date From");
      }
      sql += " AND o.created_at >= ?";
      params.push(date_from);
    }

    if(date_to){
      date_to = validDate(date_to);
      if(date_to === null){
        throw new AppError(400, "Invalid Date To");
      }
      sql += " AND o.created_at < DATE_ADD(?, INTERVAL 1 DAY)";
      params.push(date_to);
    }

    if(order_status){
      if(!constants.ORDER_STATUSES.includes(order_status)){
        throw new AppError(400, 'Invalid order status');
      }
      sql += " AND o.order_status = ?";
      params.push(order_status);
    }

    if(payment_status){
      if(!constants.PAYMENT_STATUSES.includes(payment_status)){
        throw new AppError(400, 'Invalid payment status');
      }
      sql += " AND o.payment_status = ?";
      params.push(payment_status);
    }

    if(payment_method){
      if(!constants.PAYMENT_METHODS.includes(payment_method)){
        throw new AppError(400, 'Invalid order status');
      }
      sql += " AND o.payment_method = ?";
      params.push(payment_method);
    }

    if(amount_from){
      amount_from = validDecimal(amount_from);
      if(amount_from === null){
        throw new AppError(400, "Invalid Amount From");
      }
      sql += " AND o.amount >= ?";
      params.push(amount_from);
    }

    if(amount_to){
      amount_to = validDecimal(amount_to);
      if(amount_to === null){
        throw new AppError(400, "Invalid Amount To");
      }
      sql += " AND o.amount <= ?";
      params.push(amount_to);
    }
    sql += " ORDER BY o.created_at DESC";
    const [orders] = await db.execute(sql, params);

    return res.status(200).json({
      message: 'Filtered orders fetched successfully',
      orders 
    });


  } catch(error) {
    next(error);
  }
};


export const getOrder = async (req, res, next) => {
  const orderID = validID(req.params.orderID);

  try {
    if(orderID===null){
      throw new AppError(422, 'Invalid Order ID');
    }

    const [orderRows] = await db.execute(`
      SELECT o.*, a.city, a.state, a.pincode, a.address_line, u.name AS customer_name,
      s.salesPersonID, sp.name AS salesperson_name
      FROM Orders o
      LEFT JOIN SalesPersonOrders s ON s.orderID = o.orderID
      LEFT JOIN SalesPersons sp ON s.salesPersonID = sp.salesPersonID
      JOIN Addresses a ON o.addressID = a.addressID
      JOIN Users u ON o.userID = u.userID
      WHERE o.orderID = ?
    `, [orderID]);

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
    const limit = validID(req.query.limit);
    const page = validID(req.query.page);

    if (limit === null || limit > constants.MAX_LIMIT){
      throw new AppError(400, `Limit must be a valid number below ${constants.MAX_LIMIT}`);
    }

    if(page === null){
      throw new AppError(400, "Page must be a valid number");
    }

    const offset = (page - 1) * limit;
    const [orders] = await db.execute(`
      SELECT 
        o.orderID, 
        o.created_at, 
        o.payment_method, 
        o.payment_status, 
        o.order_status, 
        o.order_location,
        o.amount,
        o.profit,
        o.tax,
        u.userID, 
        u.name AS customer_name, 
        u.email
      FROM Orders o
      JOIN Users u ON o.userID = u.userID
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `, [`${limit}`, `${offset}`]);

    const [count] = await db.execute(`
      SELECT COUNT(*) AS count
      FROM Orders o
      JOIN Users u ON o.userID = u.userID
    `);

    return res.status(200).json({ 
      message: 'All orders fetched successfully',
      total: count[0].count,
      orders 
    });

  } catch (error) {
    next(error);
  }
};


export const getReturnsByDateRange = async (req, res, next) => {
    const { dateFrom, dateTo, page = 1, limit = 10 } = req.query;
    let conn;

    if (!dateFrom || !dateTo) {
        return next(new AppError(400, 'Both dateFrom and dateTo are required.'));
    }

    const startDate = `${dateFrom} 00:00:00`;
    const endDate = `${dateTo} 23:59:59`;

    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    const offset = (parsedPage - 1) * parsedLimit;

    try {
        conn = await db.getConnection();
        const countSql = `
            SELECT COUNT(oi.orderItemID) AS total
            FROM OrderItems AS oi
            JOIN Orders AS o ON oi.orderID = o.orderID
            WHERE oi.quantity < 0 
            AND o.created_at BETWEEN ? AND ?;
        `;

        const [countRows] = await conn.execute(countSql, [startDate, endDate]);
        const totalReturns = countRows[0].total;

       const selectSql = `
            SELECT 
                oi.orderID, 
                u.name AS customer_name, 
                oi.name AS product_name, 
                oi.variantID, 
                oi.color,
                oi.size,
                o.created_at,
                
                -- The Quantity Returned (converted to positive)
                ABS(oi.quantity) AS returned_quantity,

                -- The Base Price (Discounted, No Tax)
                oi.price_at_purchase AS base_price,

                -- The Tax Rate stored on the item
                oi.tax AS tax_rate,

                -- CALCULATION: (Base Price + Tax Amount)
                -- We treat tax as a number. If it's 0 or null, we default to 0.
                (oi.price_at_purchase + (oi.price_at_purchase * (IFNULL(oi.tax, 0) / 100))) 
                AS unit_refund_amount_inc_tax,

                -- TOTAL REFUND: Unit Refund * Quantity
                (
                    (oi.price_at_purchase + (oi.price_at_purchase * (IFNULL(oi.tax, 0) / 100))) 
                    * ABS(oi.quantity)
                ) AS total_credit

            FROM OrderItems AS oi
            JOIN Orders AS o ON oi.orderID = o.orderID
            JOIN Users u ON o.userID = u.userID
            WHERE 
                oi.quantity < 0 
                AND o.created_at BETWEEN ? AND ? 
            ORDER BY o.created_at DESC
            LIMIT ${parsedLimit} OFFSET ${offset};
        `;

        const [returnItems] = await conn.execute(selectSql, [startDate, endDate]);

        res.status(200).json({
            message: `Returns fetched successfully.`,
            returns: returnItems,
            total: totalReturns,
            page: parsedPage,
            limit: parsedLimit
        });

    } catch (error) {
        console.error("SQL Execution Error:", error.message);
        if (conn) await conn.rollback();
        next(error);

    } finally {
        if (conn) conn.release();
    }
};