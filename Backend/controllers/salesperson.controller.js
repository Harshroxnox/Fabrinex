import { db } from '../index.js';
import AppError from "../errors/appError.js";
import { validID, validWholeNo, validString, validPhoneNumber, validDecimal, validDate } from "../utils/validators.utils.js";

export const addSalesperson = async (req, res, next) => {
    try {
        const name = validString(req.body.name, 3, 100);
        const validatedPhoneNumber = validPhoneNumber(req.body.phone_number);
        const commission = validWholeNo(req.body.commission);

        if (name == null) {
            throw new AppError(400, "Name must be a valid string between 3 to 100 characters");
        }
        if (validatedPhoneNumber == null) {
            throw new AppError(400, "Phone number must be valid");
        }
 
        if (commission == null || commission <= 0 || commission >= 100) { //valid commission :(1 to 99)
            throw new AppError(400, "Commission rate must be a valid percentage between 0 and 100 excluding");
        }

        const [result] = await db.execute(
            "INSERT INTO SalesPersons (name, phone_number, commission) VALUES (?, ?, ?)",
            [name, validatedPhoneNumber, commission]
        );

        res.status(201).json({
            message: "Salesperson added",
            salesPersonID: result.insertId
        });

    } catch (error) {
        error.context = {
            name: req.body.name,
            phone_number: req.body.phone_number,
            commission: req.body.commission
        };
        next(error);
    }
};

export const updateCommission = async (req, res, next) => {
    const salesPersonID = validID(req.params.salesPersonID);
    const commission = validDecimal(req.body.commission);

    try {
        if (salesPersonID == null) {
            throw new AppError(400, "Invalid Salesperson ID");
        }
        
        if (commission == null || commission <= 0 || commission >= 100) {
            throw new AppError(400, "Commission rate must be a valid percentage between 0 and 100 excluding");
        }
        const [result] = await db.execute(
            `UPDATE SalesPersons SET commission = ? WHERE salesPersonID = ? AND is_active = TRUE`,
            [commission, salesPersonID]
        );
        if (result.affectedRows === 0) {
            throw new AppError(404, "Salesperson not found or inactive");
        }
        res.status(200).json({
            message: "Salesperson commission updated",
            salesPersonID
        });

    } catch (error) {
        error.context = { salesPersonID, commission };
        next(error);
    }
};

export const deleteSalesperson = async (req, res, next) => {
    const salesPersonID = validID(req.params.salesPersonID);

    try {
        if (salesPersonID === null) {
            throw new AppError(400, "Invalid Salesperson ID");
        }

        const [result] = await db.execute(
            `UPDATE SalesPersons SET is_active = ? WHERE salesPersonID = ?`,
            [false, salesPersonID]
        );

        if (result.affectedRows === 0) {
            throw new AppError(404, "Salesperson not found or already inactive");
        }

        res.status(200).json({
            message: "Salesperson account deleted",
            salesPersonID
        });

    } catch (error) {
        error.context = { salesPersonID };
        next(error);
    }
};

export const getAllSalesPersons = async (req, res, next) => {
    try {
        const [salesPersons] = await db.execute(`
            SELECT
            s.salesPersonID,
            s.name,
            s.commission,
            s.phone_number
            FROM
            SalesPersons s
            WHERE 
            s.is_active = TRUE
            ORDER BY s.created_At DESC
        `);

        //get the count of total no of salespersons
        const [count] = await db.execute(`
            SELECT COUNT(*) AS count
            FROM SalesPersons s
            WHERE s.is_active = TRUE
        `);
        res.status(200).json({
            message: "All salespersons fetched successfully",
            total: count[0].count,
            salesPersons
        })
    } catch (error) {
        next(error);
    }
}

export const salesPersonOrders = async (req, res, next) => {
  try {
    const salesPersonID = validID(req.params.salesPersonID);
    const date_from = validDate(req.query.date_from);
    const date_to = validDate(req.query.date_to);

    if(salesPersonID === null){
      throw new AppError(400, "Invalid salespersonID");
    }
    if(date_from === null){
      throw new AppError(400, "Invalid Date From");
    }
    if(date_to === null){
      throw new AppError(400, "Invalid Date To");
    }

    const [orders] = await db.execute(`
      SELECT o.*, s.commission, s.salesPersonID, (o.amount*s.commission/100) AS commission_amt
      FROM Orders o
      JOIN SalesPersonOrders s ON o.orderID = s.orderID
      WHERE o.created_at >= ? AND o.created_at < DATE_ADD(?, INTERVAL 1 DAY)
      AND s.salesPersonID = ?
    `, [date_from, date_to, salesPersonID]);

    const [commission] = await db.execute(`
      SELECT SUM(o.amount*s.commission/100) AS commission
      FROM Orders o
      JOIN SalesPersonOrders s ON o.orderID = s.orderID
      WHERE o.created_at >= ? AND o.created_at < DATE_ADD(?, INTERVAL 1 DAY)
      AND s.salesPersonID = ?
    `, [date_from, date_to, salesPersonID]);

    res.status(200).json({
      message: "Salesperson orders fetched successfully",
      commission: commission[0].commission,
      orders
    });

  } catch(error){
    next(error);
  }
}