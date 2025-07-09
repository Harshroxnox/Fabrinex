import multer from "multer";
const {MulterError}= multer;

const ErrorHandler = (err,req,res,next)=>{
    console.log("Error Handling Middleware");
    //check for multi-specific errors
    if(err instanceof MulterError){ //error thrown by multer?
        return res.status(413).json({
            success:false,
            status:413,
            message:`File upload error: ${err.message}`,
            source: 'multer-middleware',
            stack:process.env.NODE_ENV=== 'development'? err.stack:{}
        });
    }
    if (err.message === "Invalid file type") {
    return res.status(415).json({
        success: false,
        status: 415,
        message: "Only JPG, PNG, WEBP files are allowed",
        source: 'multer-middleware',
        stack:process.env.NODE_ENV=== 'development'? err.stack:{}
    });
}
    //fallback for other errors
    const errStatus= err.statusCode || 500;
    const errMsg= err.message || 'Internal Server Error';
    res.status(errStatus).json({
        success:false,
        status: errStatus,
        message:errMsg,
        source: err.source || 'unknown',
        stack: process.env.NODE_ENV==='development' ? err.stack :{}
    });
};
export default ErrorHandler;