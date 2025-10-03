import { constants } from '../config/constants.js';
import AppError from '../errors/appError.js';
import { db } from '../index.js';
import { validDate, validID, validString } from '../utils/validators.utils.js';

export const createPurchase = async (req ,res , next) => {
    const { metaData , purchaseDate, items} = req.body;
    let conn;
    try {
        conn = await db.getConnection();
        await conn.beginTransaction();

        const purchaseQuery = 'INSERT INTO Purchases (metaData, purchaseDate) VALUES (?, ?)';
        const [purchaseResult ] = await conn.query(purchaseQuery, [
            JSON.stringify(metaData),
            purchaseDate
        ]);

        const purchaseId = purchaseResult.insertId;
        const itemsToInsert = items.map(item => [
            purchaseId,
            item.barcode,
            item.hsn_code,
            item.quantity
        ]);
        const itemsQuery = 'INSERT INTO PurchaseItems (purchaseID , barcode, hsn_code, quantity) VALUES ? ';
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
        next(error);
    } finally {
        if (conn) conn.release();
    }   
};

export const getPurchaseById = async (req, res, next) => {
    const purchaseID = validID(req.params.purchaseID);
    try {
        if (purchaseID === null) {
            throw new AppError(400, "Invalid purchaseID");
        }
        // SQL JOIN to get data from both tables at once
        const [rows] = await db.execute(`
            SELECT
                p.purchaseID,
                p.metaData,
                p.purchaseDate,
                pi.itemID,
                pi.barcode,
                pi.hsn_code,
                pi.quantity
            FROM Purchases AS p
            INNER JOIN PurchaseItems AS pi ON p.purchaseID = pi.purchaseID
            WHERE p.purchaseID = ?;
        `, [purchaseID]);

        // If no rows are returned, the purchase was not found
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Purchase not found'
            });
        }
        const totalItems = rows.length;
        const totalQuantity = rows.reduce( ( sum, item) => sum + item.quantity , 0);
        
        const purchaseDetails = {
            purchaseID: rows[0].purchaseID,
            metaData: rows[0].metaData,
            purchaseDate: rows[0].purchaseDate,
            totalItems: totalItems,
            totalQuantity: totalQuantity,
            items: rows.map(row => ({
                itemID: row.itemID,
                barcode: row.barcode,
                hsn_code: row.hsn_code,
                quantity: row.quantity
            }))
        };
        res.status(200).json({
            message: "Fetched purchase successfully",
            data: purchaseDetails
        });
    } catch (error) {
        next(error);
    }
};

export const getAllPurchases = async (req, res, next) => {
    try {
        const limit = validID(req.query.limit);
        const page = validID(req.query.page);

        if (limit === null || limit > constants.MAX_LIMIT) {
        throw new AppError(400, `Limit must be a valid number below ${constants.MAX_LIMIT}`);
        }

        if (page === null) {
        throw new AppError(400, "Page must be a valid number");
        }

        const offset = (page - 1) * limit;
        const [purchases] = await db.execute(`
            SELECT
                purchaseID, 
                metaData, 
                purchaseDate 
            FROM 
                Purchases 
            ORDER BY purchaseDate, purchaseID DESC
            LIMIT ? OFFSET ?
        `, [`${limit}`, `${offset}`]);

        const [count] = await db.execute(`
            SELECT COUNT(*) AS count
            FROM Purchases
        `);
        
        const totalPurchases = count[0].count;

        res.status(200).json({
            success: true,
            data: purchases,
            pagination: {
                total: totalPurchases,
                page: page,
                limit: limit,
                totalPages: Math.ceil(totalPurchases / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};


export const searchPurchasesBySeller = async (req, res, next) => {
  try {
    const supplier = validString(req.query.supplier);
    const limit = validID(req.query.limit);
    const page = validID(req.query.page);

    if (limit === null || limit > constants.MAX_LIMIT) {
      throw new AppError(400, `Limit must be a valid number below ${constants.MAX_LIMIT}`);
    }

    if (page === null) {
      throw new AppError(400, "Page must be a valid number");
    }
    
    if (supplier === null) {
      throw new AppError(400, "Please provide a supplier name to search for.");
    }

    const offset = (page - 1) * limit;
    const searchTerm = `%${supplier}%`;

    const [purchases] = await db.execute(
        `SELECT 
        purchaseID, 
        metaData, 
        purchaseDate 
        FROM 
        Purchases 
        WHERE metaData->>'$.supplier' LIKE ?
        ORDER BY purchaseDate, purchaseID DESC 
        LIMIT ? OFFSET ?
        `, [searchTerm ,`${limit}`, `${offset}` ]
    );

    const [totalResult] = await db.execute(
        `SELECT COUNT(*) as total 
        FROM Purchases 
        WHERE metaData->>'$.supplier' LIKE ?
        `, [searchTerm]
    );
    const totalPurchases = totalResult[0].total;

    res.status(200).json({
      success: true,
      data: purchases,
      pagination: {
        total: totalPurchases,
        page: page,
        limit: limit,
        totalPages: Math.ceil(totalPurchases / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const searchPurchasesByDateRange = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const limit = validID(req.query.limit);
    const page = validID(req.query.page);

    if (!startDate || !endDate) {
      throw new AppError(400, 'Please provide both a startDate and an endDate.');
    }

    if (limit === null || limit > constants.MAX_LIMIT) {
      throw new AppError(400, `Limit must be a valid number below ${constants.MAX_LIMIT}`);
    }

    if (page === null) {
      throw new AppError(400, "Page must be a valid number");
    }

    const offset = (page - 1) * limit;
    const start = `${startDate} 00:00:00`;
    const end = `${endDate} 23:59:59`;

    const [purchases] = await db.execute(
        `SELECT 
        purchaseID, 
        metaData, 
        purchaseDate 
        FROM 
        Purchases 
        WHERE purchaseDate BETWEEN ? AND ?
        ORDER BY purchaseDate, purchaseID DESC 
        LIMIT ? OFFSET ?
        `, [start, end, `${limit}`, `${offset}` ]
    );

    const [totalResult] = await db.execute(
        `SELECT COUNT(*) as total 
        FROM Purchases 
        WHERE purchaseDate BETWEEN ? AND ?`
      , [start, end]
    );
    const totalPurchases = totalResult[0].total;

    res.status(200).json({
      success: true,
      data: purchases,
      pagination: {
        total: totalPurchases,
        page: page,
        limit: limit,
        totalPages: Math.ceil(totalPurchases / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};