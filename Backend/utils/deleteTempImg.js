import fs from 'fs';

export const deleteTempImg = async (localFilePath) => {
  if (!localFilePath) {
    console.warn('No file path provided to deleteTempImg.');
    return false;
  }

  await fs.promises.unlink(localFilePath);
  console.log(`Temporary file deleted: ${localFilePath}`);
  return true;
};
