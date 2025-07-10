import { MulterError } from "multer";
import AppError from "../errors/appError.js";
import logger from "../utils/logger.js";

const errorHandler = (error, req, res, next) => {
  // Error thrown by multer
  if (error instanceof MulterError) {
    if (error.code === 'LIMIT_UNEXPECTED_FILE'){
      return res.status(415).json({ error: "Only JPG, PNG, WEBP files are allowed" });
    }
    return res.status(413).json({ error: `File upload error: ${error.message}`});
  }

  // AppError
  if (error instanceof AppError){
    // 4XX status code errors
    if(error.status === 'fail'){
      return res.status(error.statusCode).json({ error: error.message })
    }

    // 500 internal server errors of AppError
    logger.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }

  // Fallback for other errors
  // First log the error using our logger so that we can see it in the logs
  logger.error(error);
  res.status(500).json({ error: 'Internal server error'});
};

export default errorHandler;
