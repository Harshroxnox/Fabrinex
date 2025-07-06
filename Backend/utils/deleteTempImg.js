import fs from 'fs';

export const deleteTempImg = async (localFilePath) => {
  if (!localFilePath) {
    console.warn('No file path provided to deleteTempImg.');
    return false;
  }

  try {
    await fs.promises.unlink(localFilePath);
    console.log(`Temporary file deleted: ${localFilePath}`);
    return true;
  } catch (error) {
    console.error(`Failed to delete file at ${localFilePath}:`, error.message);
    return false;
  }
};
