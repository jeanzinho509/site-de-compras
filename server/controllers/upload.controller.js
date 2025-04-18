const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/db');

// Base upload directory
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// Ensure upload directories exist
function ensureDirectoriesExist() {
  const dirs = [
    UPLOAD_DIR,
    path.join(UPLOAD_DIR, 'products'),
    path.join(UPLOAD_DIR, 'categories'),
    path.join(UPLOAD_DIR, 'users')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// Upload product image
exports.uploadProductImage = async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Ensure directories exist
    ensureDirectoriesExist();
    
    // Generate unique filename
    const fileExtension = path.extname(req.file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join('products', fileName);
    const fullPath = path.join(UPLOAD_DIR, filePath);
    
    // Write file to disk
    fs.writeFileSync(fullPath, req.file.buffer);
    
    // Generate URL
    const imageUrl = `/uploads/${filePath.replace(/\\/g, '/')}`;
    
    res.status(200).json({
      message: 'Image uploaded successfully',
      imageUrl
    });
  } catch (error) {
    console.error('Upload product image error:', error);
    res.status(500).json({ message: 'Server error during image upload' });
  }
};

// Upload category image
exports.uploadCategoryImage = async (req, res) => {
  try {
    // Ensure user is authenticated and is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Ensure directories exist
    ensureDirectoriesExist();
    
    // Generate unique filename
    const fileExtension = path.extname(req.file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join('categories', fileName);
    const fullPath = path.join(UPLOAD_DIR, filePath);
    
    // Write file to disk
    fs.writeFileSync(fullPath, req.file.buffer);
    
    // Generate URL
    const imageUrl = `/uploads/${filePath.replace(/\\/g, '/')}`;
    
    res.status(200).json({
      message: 'Image uploaded successfully',
      imageUrl
    });
  } catch (error) {
    console.error('Upload category image error:', error);
    res.status(500).json({ message: 'Server error during image upload' });
  }
};

// Upload user avatar
exports.uploadUserAvatar = async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Ensure directories exist
    ensureDirectoriesExist();
    
    // Generate unique filename
    const fileExtension = path.extname(req.file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join('users', fileName);
    const fullPath = path.join(UPLOAD_DIR, filePath);
    
    // Write file to disk
    fs.writeFileSync(fullPath, req.file.buffer);
    
    // Generate URL
    const imageUrl = `/uploads/${filePath.replace(/\\/g, '/')}`;
    
    // Update user avatar in database
    await pool.query(
      'UPDATE users SET avatar_url = ? WHERE id = ?',
      [imageUrl, req.user.id]
    );
    
    res.status(200).json({
      message: 'Avatar uploaded successfully',
      imageUrl
    });
  } catch (error) {
    console.error('Upload user avatar error:', error);
    res.status(500).json({ message: 'Server error during avatar upload' });
  }
};

// Delete image
exports.deleteImage = async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ message: 'Image URL is required' });
    }
    
    // Extract file path from URL
    const urlPath = imageUrl.replace('/uploads/', '');
    const filePath = path.join(UPLOAD_DIR, urlPath);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Image not found' });
    }
    
    // Delete file
    fs.unlinkSync(filePath);
    
    res.status(200).json({
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ message: 'Server error during image deletion' });
  }
};