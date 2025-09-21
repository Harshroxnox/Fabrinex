import multer from "multer";
const { MulterError } = multer;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./Public/temp");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

// Common image filter
// In multer.middleware.js

import path from 'path'; // Make sure this is imported


// Common image filter
const imageFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

  if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    // Throw a new Error with a specific message for images
    cb(new Error("Invalid file type. Only JPG, PNG, and WEBP files are allowed."), false);
  }
};

// PDF filter
const pdfFilter = (req, file, cb) => {
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (file.mimetype === "application/pdf" || fileExtension === '.pdf') {
    cb(null, true);
  } else {
    // Throw a new Error with a specific message for PDFs
    cb(new Error("Invalid file type. Only PDF files are allowed."), false);
  }
};

// Multer instances
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
});

export const uploadPdf = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // e.g., 10MB limit
  fileFilter: pdfFilter,
});
