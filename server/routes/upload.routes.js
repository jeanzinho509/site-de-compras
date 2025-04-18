const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadController = require('../controllers/upload.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Upload product image
router.post('/product', authMiddleware.verifyToken, upload.single('image'), uploadController.uploadProductImage);

// Upload category image (admin only)
router.post('/category', authMiddleware.verifyToken, authMiddleware.isAdmin, upload.single('image'), uploadController.uploadCategoryImage);

// Upload user avatar
router.post('/avatar', authMiddleware.verifyToken, upload.single('image'), uploadController.uploadUserAvatar);

// Delete image
router.delete('/', authMiddleware.verifyToken, uploadController.deleteImage);

// Error handling middleware
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ message: err.message });
  } else if (err) {
    // An unknown error occurred
    return res.status(500).json({ message: err.message });
  }
  next();
});

module.exports = router;