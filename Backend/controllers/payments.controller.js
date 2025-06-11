import { razorpay } from "../utils/razorpay.utils.js";
import { db } from '../index.js'; 
import * as crypto from 'crypto';
import { constants } from "../config/constants.js";

export const createOrder = async (req, res) => {
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
        holder_name,
        expiry,
        network
    } = req.body;
    
    if (!constants.PAYMENT_NETWORKS.includes(network.toLowerCase())) {
        return res.status(400).json({ error: 'Invalid payment network' });
    }

    if (!/^\d{4}-\d{2}$/.test(expiry)) {
        return res.status(400).json({ error: 'Invalid expiration format (expected YYYY-MM)' });
    }
    
    try {
        await db.execute(
            `INSERT INTO Payments 
            (userID, last4_card_no, card_holder_name, expiration, payment_network, razorpay_token)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [userID, last4, holder_name, expiry, network, card_token]
        );
    
        res.json({ message: 'Card saved' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save card' });
    }
};

export const chargeSavedCard = async (req, res) => {
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