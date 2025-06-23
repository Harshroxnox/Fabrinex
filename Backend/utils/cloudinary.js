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

            // Safely delete the local file            
            await fs.promises.unlink(localFilePath);
            console.log(`Temporary file deleted: ${localFilePath}`);

            return response;
        }

        // Do this for development
        const response = {
            url: "http://res.cloudinary.com/dkvsin0cs/image/upload/v1750657987/qrbfty0zquwkr3mi3qvl.png",
            public_id: crypto.randomBytes(6).toString('hex')
        }

        // Safely delete the local file            
        await fs.promises.unlink(localFilePath);
        console.log(`Temporary file deleted: ${localFilePath}`);

        return response;

    } catch (error) {
        console.error('Upload failed:', error);

        // Safely delete the local file            
        await fs.promises.unlink(localFilePath);
        console.log(`Temporary file deleted: ${localFilePath}`);

        return null;
    }
};


const deleteFromCloudinary = async (publicId) => {
    if(process.env.NODE_ENV === 'production'){
        const response = await cloudinary.uploader.destroy(publicId);
        return response;
    }

    // Do this instead in development
    const response = {
        result: "ok"
    }
    return response;
};

export { uploadOnCloudinary, deleteFromCloudinary };
