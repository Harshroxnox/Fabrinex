import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import crypto from 'crypto';


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
        if(process.env.NODE_ENV === 'production'){
            // Upload the file to Cloudinary
            const response = await cloudinary.uploader.upload(localFilePath, {
                resource_type: 'auto',
                timeout: 60000,
            });
            console.log('Upload successful:', response);

            return response;
        }

        // Do this for development
        const response = {
            url: "http://res.cloudinary.com/dkvsin0cs/image/upload/v1750657987/qrbfty0zquwkr3mi3qvl.png",
            public_id: crypto.randomBytes(6).toString('hex')
        }

        return response;

    } catch (error) {
        console.error('Upload failed:', error);

        return null;
    }
};


const deleteFromCloudinary = async (publicId) => {
  try{
    if(process.env.NODE_ENV === 'production'){
        const response = await cloudinary.uploader.destroy(publicId);
        if (response.result !== "ok") {
            console.warn("Failed to delete Cloudinary image:", publicId);
        }
        return response;
    }

    // Do this instead in development
    const response = {
        result: "ok"
    }
    return response;
  } catch (error) {
    console.error("Error deleting from cloudinary:", error);
    console.warn("Cloudinary deletion failed. CloudinaryID:", publicId);
    return { result: "error"};
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
