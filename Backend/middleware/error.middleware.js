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
  }

  const context = {
    method: req.method,
    url: req.originalUrl,
    ...(error.context || {})
  };

  // Fallback for other errors
  // First log the error using our logger so that we can see it in the logs
  logger.error(error.message, {
    context,
    stack: error.stack
  });
  res.status(500).json({ error: 'Internal server error' });
};

export default errorHandler;
