import { razorpay } from "../utils/razorpay.utils.js";
import { db } from '../index.js';
import * as crypto from 'crypto';
import { constants } from "../config/constants.js";
import { validDecimal, validID, validStringChar } from "../utils/validators.utils.js";


export const createOrder = async (req, res) => {
  // This amount is in rupee
  const { amount, orderID } = req.body;
  //validate amount
  if(validDecimal(amount)===null || Number(amount)<=0 ){
    return res.status(422).json({error:'Invalid amount entered'})
  }
  if(validID(orderID)===null){
    return res.status(422).json({error:'Invalid orderid'});
  }
  try {
    const options = {
      amount: amount * 100, // amount in paise
      currency: 'INR',
      receipt: 'OrderID#' + orderID,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({
      message: "Razorpay payment order created successfully.", 
      order 
    });
  } catch (error) {
    console.error('Error creating razorpay payment order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderID
  } = req.body;
  let conn;

  //VALIDATE ORDER ID
  if(validID(orderID)===null){
    return res.status(422).json({error:'Invalid order id'})
  }
  // verify the signature, it guarantees top three fields are untampered
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  const isValid = generatedSignature === razorpay_signature;
  if (!isValid) {
    return res.status(400).json({ error: 'Invalid signature' });
  }

  // verfiy that the payment was successfull and extract payment info
  const payment = await razorpay.payments.fetch(razorpay_payment_id);
  if (payment.status !== 'captured') {
    return res.status(400).json({ error: `Payment not captured. Status: ${payment.status}` });
  }
  const amount = parseFloat((payment.amount / 100).toFixed(2));
  const payment_method = payment.method;

  // validate payment method
  if (!constants.PAYMENT_METHODS.includes(payment_method)) {
    return res.status(400).json({ error: 'Invalid payment method' });
  }

  try {
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
    res.status(200).json({ message: "Successfully verified!" });

  } catch (error) {
    if (conn) await conn.rollback(); // rollback if failed
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Internal server error' });

  } finally {
    if (conn) conn.release(); // always release connection
  }
};


export const saveCard = async (req, res) => {
  const userID = req.userID;
  const {
    card_token,
    last4, //last4 valid
    expiry,
    network
  } = req.body;

  if (!constants.PAYMENT_NETWORKS.includes(network)) {
    return res.status(400).json({ error: 'Invalid payment network' });
  }

  if (!/^\d{4}-\d{2}$/.test(expiry)) {
    return res.status(400).json({ error: 'Invalid expiration format (expected YYYY-MM)' });
  }

  try {
    await db.execute(
      `INSERT INTO Cards
      (userID, last4_card_no, expiration, payment_network, razorpay_token)
      VALUES (?, ?, ?, ?, ?)`,
      [userID, last4, expiry, network, card_token]
    );

    res.status(200).json({ message: 'Card saved' });
  } catch (error) {
    console.error('Error saving card:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const chargeSavedCard = async (req, res) => {
  // This amount is in rupee
  const { amount, razorpay_token, razorpay_customer_id } = req.body;
  
  //validate amount
  if(validDecimal(amount)===null || Number(amount)<=0 ){
    return res.status(422).json({error:'Invalid amount entered'})
  }
  try {
    const payment = await razorpay.payments.create({
      amount: amount * 100,
      currency: 'INR',
      customer_id: razorpay_customer_id,
      token: razorpay_token,
      method: 'card'
    });

    res.status(200).json({
      message: "Created payment of saved card successfully", 
      payment 
    });
  } catch (error) {
    console.error('Error charging card:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const verifySavedCardPayment = async (req, res) => {
  const {
    razorpay_payment_id,
    orderID
  } = req.body;

  //validate order ID
  if(validID(orderID)===null){
    return res.status(422).json({error:'Invalid order id'})
  }
  let conn;

  try {
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

    // Make connection for transaction
    conn = await db.getConnection();
    await conn.beginTransaction();

    await conn.execute(
      `INSERT INTO Transactions (orderID, razorpay_payment_id, amount) VALUES (?, ?, ?)`,
      [orderID, razorpay_payment_id, amount]
    );

    await conn.execute(
      `UPDATE Orders SET payment_status = 'completed', payment_method = 'card' WHERE orderID = ?`,
      [orderID]
    );

    // commit database changes
    await conn.commit();
    res.status(200).json({ message: "Successfully verified!" });

  } catch (error) {
    // rollback database changes
    if (conn) await conn.rollback();
    console.error('Error verifying saved card payment:', error);
    res.status(500).json({ error: 'Internal server error' });

  } finally {
    if (conn) conn.release(); // release connection
  }
};


export const getCards = async (req, res) => {
  const userID = req.userID;

  try {
    const [cards] = await db.execute(`
      SELECT cardID, last4_card_no, expiration, payment_network 
      FROM Cards WHERE userID = ? 
    `, [userID]);

    res.status(200).json({
      message: "Fetched user cards successfully", 
      cards
    });
  } catch (error) {
    console.error('Error fetching user cards:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const deleteCard = async (req, res) => {
  const { cardID } = req.params;
  const userID = req.userID;
  //validate cardID
  if(validID(cardID)===null){
    return res.status(422).json({error:'Invalid card ID provided'});
  }

  if (!userID || !cardID) {
    return res.status(400).json({ error: "Missing userID or cardID" });
  }

  try {
    const [cards] = await db.execute(
      "SELECT razorpay_token FROM Cards WHERE cardID = ? AND userID = ?",
      [cardID, userID]
    );

    if (cards.length === 0) {
      return res.status(404).json({ error: "Card not found or unauthorized" });
    }

    // Delete the card from razorpay
    const [users] = await db.execute("SELECT razorpay_customer_id FROM Users WHERE userID = ?", [userID])
    const razorpay_customer_id = users[0].razorpay_customer_id;
    const card_razorpay_token = cards[0].razorpay_token
    await razorpay.customers.deleteToken(razorpay_customer_id, card_razorpay_token);

    // Delete the card from DB
    await db.execute(
      "DELETE FROM Cards WHERE cardID = ? AND userID = ?",
      [cardID, userID]
    );

    res.status(200).json({ message: "Card deleted successfully" });

  } catch (error) {
    console.error('Error deleting card:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
