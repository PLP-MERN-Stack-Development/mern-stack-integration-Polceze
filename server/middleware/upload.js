// upload.js - Multer configuration for file uploads

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Set Storage Engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Save files to the 'uploads' directory in the server root
    cb(null, uploadDir); 
  },
  filename: (req, file, cb) => {
    // Create a unique filename: fieldname-timestamp.ext
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

// Check File Type
const fileFilter = (req, file, cb) => {
  // Accept only common image types
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    // Reject file (will be handled by custom error middleware later)
    cb(new Error('Only image files are allowed!'), false); 
  }
};

// Initialize upload variable
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter,
});

module.exports = upload;