import fs from 'fs';
import logger from './logger.js';

export const deleteTempImg = async (localFilePath) => {
  if (!localFilePath) {
    logger.warn('No file path provided to deleteTempImg.');
    return false;
  }

  await fs.promises.unlink(localFilePath);
  logger.debug(`Temporary file deleted: ${localFilePath}`);
  return true;
};
