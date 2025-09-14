import { db } from '../index.js';
import { validID, validBoolean, validWholeNo, validString, validURL } from '../utils/validators.utils.js';
import AppError from '../errors/appError.js';


export const getMetrics = async (req, res, next) => {
  try {
    return res.status(200).json({ message: "Hello World" });    

  } catch (error) {
    next(error);
  }
};