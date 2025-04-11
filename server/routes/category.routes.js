const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Get all categories
router.get('/', categoryController.getAllCategories);

// Get category by ID
router.get('/:id', categoryController.getCategoryById);

// Create new category (admin only)
router.post('/', authMiddleware.verifyToken, authMiddleware.isAdmin, categoryController.createCategory);

// Update category (admin only)
router.put('/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, categoryController.updateCategory);

// Delete category (admin only)
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, categoryController.deleteCategory);

module.exports = router;
