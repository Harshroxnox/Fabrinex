// In error.handler.js

import { MulterError } from "multer";
import logger from "../utils/logger.js";

const errorHandler = (error, req, res, next) => {
  // Log the actual error for debugging purposes on the server
  logger.error(error.message);
  console.log(error.message);


  if (error.message.includes("Invalid file type")) {
    return res.status(415).json({ error: error.message });
  }

  if (error instanceof MulterError) {
    return res.status(413).json({ error: `File upload error: ${error.message}` });
  }

  res.status(500).json({ error: 'Internal server error' });
};

export default errorHandler;