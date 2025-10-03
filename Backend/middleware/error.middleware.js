import { MulterError } from "multer";
import logger from "../utils/logger.js";

const errorHandler = (error, req, res, next) => {
  // Log the actual error for debugging
  logger.error(error?.message || error);
  console.log(error?.message || error);

  // Handle custom file type error , (changed by {Akshat } in commit fixed bill routes )
  if (typeof error?.message === "string" && error.message.includes("Invalid file type")) {
    return res.status(415).json({ error: error.message });
  }

  // Handle Multer upload errors
  if (error instanceof MulterError) {
    return res.status(413).json({ error: `File upload error: ${error.message}` });
  }

  // Fallback
  return res.status(500).json({ error: error.message});
};

export default errorHandler;
