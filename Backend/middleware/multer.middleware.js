import multer from "multer";
const { MulterError } = multer;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./Public/temp")
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})

const fileFilter = (req, file, cb)=>{
  const allowedTypes=['image/jpeg','image/png','image/webp'];
  if(allowedTypes.includes(file.mimetype)){
    cb(null, true);
  }
  else{
    cb(new MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname), false);
  }
};
  
export const upload = multer({ 
  storage: storage,
  limits:{ fileSize: 5 * 1024 * 1024 }, // image size limit is 5 MB
  fileFilter 
});
