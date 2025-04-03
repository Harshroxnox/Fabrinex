import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';


// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    if (!localFilePath) {
        console.warn('No file path provided.');
        return null;
    }

    try {
        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto',
            timeout: 60000,
        });
        console.log('Upload successful:', response);

        // Safely delete the local file
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
            console.log(`Temporary file deleted: ${localFilePath}`);
        } else {
            console.warn(`File not found for deletion: ${localFilePath}`);
        }

        return response;
    } catch (uploadError) {
        console.error('Upload failed:', uploadError);

        // Attempt to delete the file even if the upload fails
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
            console.log(`Temporary file deleted after failed upload: ${localFilePath}`);
        } else {
            console.warn(`File not found for deletion after failed upload: ${localFilePath}`);
        }

        return null;
    }
};

export { uploadOnCloudinary };
