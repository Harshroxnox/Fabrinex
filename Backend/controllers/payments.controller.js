import { razorpay } from "../utils/razorpay.utils.js";
import { db } from '../index.js';
import * as crypto from 'crypto';
import { constants } from "../config/constants.js";
import { validDecimal, validID, validStringNum } from "../utils/validators.utils.js";
import AppError from "../errors/appError.js";
import logger from "../utils/logger.js";


export const createOrder = async (req, res, next) => {
  // This amount is in rupee
  const userID = req.userID;
  const orderID  = validID(req.body.orderID);
  
  try {
    if(orderID === null){
      throw new AppError(400, "Invalid OrderID");
    }

    // Check if Order Exists
    const [checkOrder] = await db.execute(`
      SELECT 
        payment_status, 
        order_status, 
        promo_discount, 
        payment_method 
      FROM Orders WHERE orderID = ? AND userID = ?
    `,[orderID, userID]);

    if(checkOrder.length === 0){
      throw new AppError(404, "Order not found");
    }

    // Check payment status
    if(checkOrder[0].payment_status !== 'pending' && checkOrder[0].payment_status !== 'failed'){
      throw new AppError(400, "Payment already made");
    }

    // Check order status
    if(checkOrder[0].order_status !== 'pending'){
      if(checkOrder[0].payment_status === 'failed'){
        throw new AppError(500, "Order status is not pending but payment is failed");
      }

      // Now here orderStatus != pending and paymentStatus == pending
      // This is only possible in case of COD
      if(checkOrder[0].payment_method !== 'cash-on-delivery'){
        throw new AppError(
          500, 
          "Order is out for delhivery but payment is not made neither it is cod"
        );
      }
    }

    // Fetch user details for prefill
    const [user] = await db.execute(
      "SELECT name, email, phone_number FROM Users where userID = ?"
    , [userID])

    // Calculate amount
    const [orderTotalRows] = await db.execute(
      `SELECT SUM(price_at_purchase * quantity) AS orderTotal 
        FROM OrderItems WHERE orderID = ?`,
      [orderID]
    );

    const orderTotal = Number(orderTotalRows[0].orderTotal ?? 0);
    if(orderTotal === 0){
      throw new AppError(500, "Order exists but has no items!");
    }

    // Apply promo discount
    const promoDiscount = Number(checkOrder[0].promo_discount);
    const amount = orderTotal * (1 - (promoDiscount/100));

    const options = {
      amount: amount * 100, // amount in paise
      currency: 'INR',
      receipt: 'OrderID#' + orderID,
    };
    const order = await razorpay.orders.create(options);
    
    res.status(200).json({
      message: "Razorpay payment order created successfully.", 
      order,
      key: process.env.RAZORPAY_KEY_ID,
      user: {
        name: user[0].name,
        email: user[0].email,
        contact: user[0].phone_number
      }
    });

  } catch (error) {
    error.context = { orderID };
    next(error);
  }
};


export const verifyPayment = async (req, res, next) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  } = req.body;
  let conn;

  try{
    // verify the signature, it guarantees top three fields are untampered
    // and the razorpay_payment_id belong to the razorpay_order_id
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isValid = generatedSignature === razorpay_signature;
    if (!isValid) {
      throw new AppError(400, 'Invalid signature');
    }

    // extract orderID
    const order = await razorpay.orders.fetch(razorpay_order_id);
    logger.debug(`order: ${order}`);
    const orderID = validID(order.receipt.replace('OrderID#', ''));

    // verfiy that the payment was successfull and extract payment info
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    logger.debug(`payment: ${payment}`);
    if (payment.status !== 'captured') {
      throw new AppError(400, `Payment not captured. Status: ${payment.status}`);
    }
    const amount = parseFloat((payment.amount / 100).toFixed(2));
    const payment_method = payment.method;

    // validate payment method
    if (!constants.PAYMENT_METHODS.includes(payment_method)) {
      throw new AppError(400, 'Invalid payment method');
    }

    // using transactions to ensure consistency in database (either both gets executed or none)
    conn = await db.getConnection(); // make connection
    await conn.beginTransaction(); // begin transaction

    await conn.execute(`
      INSERT INTO Transactions 
      (orderID, razorpay_order_id, razorpay_payment_id, razorpay_signature, amount)
      VALUES (?, ?, ?, ?, ?)`,
      [orderID, razorpay_order_id, razorpay_payment_id, razorpay_signature, amount]
    );

    await conn.execute(
      `UPDATE Orders SET payment_status = 'completed', payment_method = ? WHERE orderID = ?`,
      [payment_method, orderID]
    );

    await conn.commit(); // commit if succesfull
    res.status(200).json({ message: "Payment verified successfully!" });

  } catch (error) {
    if (conn) await conn.rollback(); // rollback if failed
    error.context = { razorpay_order_id, razorpay_payment_id };
    next(error);

  } finally {
    if (conn) conn.release(); // always release connection
  }
};

