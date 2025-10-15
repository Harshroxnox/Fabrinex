import { constants } from '../config/constants.js';
import AppError from '../errors/appError.js';
import { db } from '../index.js';
import { validDate, validID, validString } from '../utils/validators.utils.js';

export const createPurchase = async (req ,res , next) => {
  const {
    invoiceNumber,
    invoiceDate,
    sellerDetails,
    buyerDetails,
    transporterDetails,
    purchaseDate,
    totalAmount,
    gstAmount,
    grandTotal,
    remarks,
    items 
  } = req.body;

    let conn;
    try {
        conn = await db.getConnection();
        await conn.beginTransaction();
        
        const purchaseQuery = `
            INSERT INTO Purchases (
                invoiceNumber, invoiceDate, sellerDetails, buyerDetails, 
                transporterDetails, purchaseDate, totalAmount, gstAmount, 
                grandTotal, remarks
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [purchaseResult] = await conn.query(purchaseQuery, [
            invoiceNumber,
            invoiceDate,
            JSON.stringify(sellerDetails),     // Stringify JSON objects
            JSON.stringify(buyerDetails),      // Stringify JSON objects
            JSON.stringify(transporterDetails),// Stringify JSON objects
            purchaseDate,
            totalAmount,
            gstAmount,
            grandTotal,
            remarks
        ]);

        const purchaseId = purchaseResult.insertId;
         if (!items || items.length === 0) {
            throw new Error('Purchase must contain at least one item.');
        }
        const itemsToInsert = items.map(item => [
            purchaseId,
            item.itemCode,
            item.barcode,
            item.description, // Can be null if not provided
            item.hsnCode,
            item.taxPercent,
            item.rate,
            item.quantity,
            item.unit,
            item.value
        ]);
        const itemsQuery = `
            INSERT INTO PurchaseItems (
                purchaseID, itemCode, barcode, description, hsnCode, taxPercent, 
                rate, quantity, unit, value
            ) VALUES ?
        `;
        await conn.query(itemsQuery, [itemsToInsert]);
        
        await conn.commit();
        res.status(201).json({
            success: true,
            message : 'Purchase created successfully',
            purchase_id : purchaseId
        });
    }
    catch (error) {
        if (conn) await conn.rollback();
        if (error.code === 'ER_DUP_ENTRY') {
             next(new Error(`Failed to create purchase. A barcode was duplicated within this single purchase.`));
        } else {
             next(error);
        }
    } finally {
        if (conn) conn.release();
    }   
};

export const getPurchaseById = async (req, res, next) => {

    console.log(req.params.id);
    const purchaseID = validID(req.params.id); 
    try {
        if (purchaseID === null) {
            throw new AppError(400, "Invalid Purchase ID provided.");
        }

        const [rows] = await db.execute(`
            SELECT
                p.purchaseID, p.invoiceNumber, p.invoiceDate, p.sellerDetails, 
                p.buyerDetails, p.transporterDetails, p.purchaseDate, p.totalAmount, 
                p.gstAmount, p.grandTotal, p.remarks,
                pi.itemID, pi.itemCode, pi.barcode, pi.description, pi.hsnCode, pi.taxPercent,
                pi.rate, pi.quantity, pi.unit, pi.value
            FROM Purchases AS p
            INNER JOIN PurchaseItems AS pi ON p.purchaseID = pi.purchaseID
            WHERE p.purchaseID = ?;
        `, [purchaseID]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Purchase not found'
            });
        }

        const purchaseDetails = {
            purchaseID: rows[0].purchaseID,
            invoiceNumber: rows[0].invoiceNumber,
            invoiceDate: rows[0].invoiceDate,
            sellerDetails: rows[0].sellerDetails,
            buyerDetails: rows[0].buyerDetails,
            transporterDetails: rows[0].transporterDetails,
            purchaseDate: rows[0].purchaseDate,
            totalAmount: rows[0].totalAmount,
            gstAmount: rows[0].gstAmount,
            grandTotal: rows[0].grandTotal,
            remarks: rows[0].remarks,
            items: rows.map(row => ({
                itemID: row.itemID,
                itemCode: row.itemCode,
                barcode: row.barcode,
                description: row.description,
                hsnCode: row.hsnCode,
                taxPercent: row.taxPercent,
                rate: row.rate,
                quantity: row.quantity,
                unit: row.unit,
                value: row.value
            }))
        };

        res.status(200).json({
            success: true,
            message: "Fetched purchase successfully",
            data: purchaseDetails
        });
    } catch (error) {
        next(error);
    }
};

export const getAllPurchases = async (req, res, next) => {
    try {
        const limit = validID(req.query.limit) || 10;
        const page = validID(req.query.page) || 1;

        if (limit > constants.MAX_LIMIT) {
            throw new AppError(400, `Limit must be below ${constants.MAX_LIMIT}`);
        }

        const offset = (page - 1) * limit;
        
        const [purchases] = await db.execute(`
            SELECT
                purchaseID, 
                invoiceNumber, 
                invoiceDate, 
                sellerDetails, 
                grandTotal
            FROM 
                Purchases 
            ORDER BY invoiceDate DESC, purchaseID DESC
            LIMIT ? OFFSET ?
        `, [`${limit}`, `${offset}`]);

        const [[{ total }]] = await db.execute(`SELECT COUNT(*) AS total FROM Purchases`);
        
        res.status(200).json({
            success: true,
            data: purchases,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};


export const searchPurchasesBySeller = async (req, res, next) => {
    try {
      console.log(req.query.supplier);
        const supplier = validString(req.query.supplier);
        console.log(supplier);
        const limit = validID(req.query.limit) || 10;
        const page = validID(req.query.page) || 1;

        if (limit > constants.MAX_LIMIT) {
            throw new AppError(400, `Limit must be below ${constants.MAX_LIMIT}`);
        }
        
        if (!supplier) {
            throw new AppError(400, "Please provide a supplier name to search for.");
        }

        const offset = (page - 1) * limit;
        const searchTerm = `%${supplier}%`;

        const query = `
            SELECT 
                purchaseID, 
                invoiceNumber, 
                invoiceDate, 
                sellerDetails, 
                grandTotal
            FROM 
                Purchases 
            WHERE 
                sellerDetails->>'$.name' LIKE ?
            ORDER BY 
                invoiceDate DESC, purchaseID DESC 
            LIMIT ? OFFSET ?
        `;
        const [purchases] = await db.execute(query, [searchTerm, `${limit}`, `${offset}`]);

        const countQuery = `
            SELECT COUNT(*) as total 
            FROM Purchases 
            WHERE sellerDetails->>'$.name' LIKE ?
        `;
        const [[{ total }]] = await db.execute(countQuery, [searchTerm]);

        res.status(200).json({
            success: true,
            data: purchases,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

export const searchPurchasesByDateRange = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const limit = validID(req.query.limit) || 10;
        const page = validID(req.query.page) || 1;

        if (!startDate || !endDate) {
            throw new AppError(400, 'Please provide both a startDate and an endDate (YYYY-MM-DD).');
        }

        if (limit > constants.MAX_LIMIT) {
            throw new AppError(400, `Limit must be below ${constants.MAX_LIMIT}`);
        }

        const offset = (page - 1) * limit;

        const query = `
            SELECT 
                purchaseID, 
                invoiceNumber, 
                invoiceDate, 
                sellerDetails, 
                grandTotal
            FROM 
                Purchases 
            WHERE 
                invoiceDate BETWEEN ? AND ?
            ORDER BY 
                invoiceDate DESC, purchaseID DESC 
            LIMIT ? OFFSET ?
        `;
        const [purchases] = await db.execute(query, [startDate, endDate, `${limit}`, `${offset}`]);

        const countQuery = `
            SELECT COUNT(*) as total 
            FROM Purchases 
            WHERE invoiceDate BETWEEN ? AND ?
        `;
        const [[{ total }]] = await db.execute(countQuery, [startDate, endDate]);

        res.status(200).json({
            success: true,
            data: purchases,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};