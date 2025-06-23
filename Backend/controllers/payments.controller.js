import { razorpay } from "../utils/razorpay.utils.js";
import { db } from '../index.js'; 
import * as crypto from 'crypto';
import { constants } from "../config/constants.js";

export const createOrder = async (req, res) => {
    // This amount is in rupee
    const { amount, orderID } = req.body;

    try {
        const options = {
            amount: amount * 100, // amount in paise
            currency: 'INR',
            receipt: 'OrderID#' + orderID,
        };
  
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create Razorpay order' });
    }
};

export const verifyPayment = async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        orderID,
        amount,
        payment_method
    } = req.body;

    if(!constants.PAYMENT_METHODS.includes(payment_method)){
        return res.status(400).json({ error: 'Invalid payment method' });
    }
    
    const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');
        
    const isValid = generatedSignature === razorpay_signature;
    
    if (!isValid) {
        return res.status(400).json({ error: 'Invalid signature' });
    }
    
    try {
        await db.execute(
            `INSERT INTO Transactions 
            (orderID, razorpay_order_id, razorpay_payment_id, razorpay_signature, amount)
            VALUES (?, ?, ?, ?, ?)`,
            [orderID, razorpay_order_id, razorpay_payment_id, razorpay_signature, amount]
        );
    
        await db.execute(
            `UPDATE Orders SET payment_status = 'completed', payment_method = ? WHERE orderID = ?`, 
            [payment_method, orderID]
        );
    
        res.json({ message: "Successfully verified!" });
    } catch (err) {
        res.status(500).json({ error: 'Transaction storage failed' });
    }
};

export const saveCard = async (req, res) => {
    const userID = req.userID;
    const {
        card_token,
        last4,
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
    
        res.json({ message: 'Card saved' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save card' });
    }
};

export const chargeSavedCard = async (req, res) => {
    // This amount is in rupee
    const { amount, razorpay_token, razorpay_customer_id } = req.body;

    try {
        const response = await razorpay.payments.create({
            amount: amount *100,
            currency: 'INR',
            customer_id: razorpay_customer_id,
            token: razorpay_token,
            method: 'card'
        });
  
        res.json(response);
    } catch (err) {
        res.status(500).json({ error: 'Charging saved card failed' });
    }
};

export const verifySavedCardPayment = async (req, res) => {
    const {
        razorpay_payment_id,
        orderID,
        amount
    } = req.body;

    try {
        // Fetch payment details from Razorpay
        const payment = await razorpay.payments.fetch(razorpay_payment_id);
        
        if (payment.status !== 'captured') {
            return res.status(400).json({ error: `Payment not captured. Status: ${payment.status}` });
        }

        await db.execute(
            `INSERT INTO Transactions (orderID, razorpay_payment_id, amount) VALUES (?, ?, ?)`,
            [orderID, razorpay_payment_id, amount]
        );
    
        await db.execute(
            `UPDATE Orders SET payment_status = 'completed', payment_method = 'card' WHERE orderID = ?`, 
            [orderID]
        );
    
        res.json({ message: "Successfully verified!" });        
    } catch (error) {
        res.status(500).json({ error: 'Verification failed'});
    }
};

export const getCards = async (req, res) => {
    const userID = req.userID;

    try {
        const [cards] = await db.execute(`
            SELECT cardID, last4_card_no, expiration, payment_network 
            FROM Cards WHERE userID = ? 
        `, [userID]);

        res.json(cards);
    } catch (error) {
        res.status(500).json({ error: "Unable to fetch Cards" });
    }
};

export const deleteCard = async (req, res) => {
    const cardID = req.params.cardID;
    const userID = req.userID;

    if (!userID || !cardID) {
        return res.status(400).json({ error: "Missing userID or cardID" });
    }

    try {
        const [cards] = await db.execute(
            "SELECT razorpay_token FROM Cards WHERE cardID = ? AND userID = ?",
            [cardID, userID]
        );

        if(cards.length === 0){
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

        res.json({ message: "Card deleted successfully" })
    } catch (error) {
        res.status(500).json({ error: "Unable to delete Card" });
    }
};