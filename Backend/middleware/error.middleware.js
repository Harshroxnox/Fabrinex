import { MulterError } from "multer";
import logger from "../utils/logger";

const errorHandler = (error, req, res, next) => {
  // Error thrown by multer
  if (error instanceof MulterError) {
    if (error.code === 'LIMIT_UNEXPECTED_FILE'){
      return res.status(415).json({ error: "Only JPG, PNG, WEBP files are allowed" });
    }
    return res.status(413).json({ error: `File upload error: ${error.message}`});
  }

  // Fallback for other errors
  // First log the error using our logger so that we can see it in the logs
  logger.error(error);
  res.status(500).json({ error: 'Internal server error'});
};

export default errorHandler;
