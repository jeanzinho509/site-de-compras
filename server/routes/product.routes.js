const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Get all products
router.get('/', productController.getAllProducts);

// Get product by ID
router.get('/:id', productController.getProductById);

// Get products by category
router.get('/category/:categoryId', productController.getProductsByCategory);

// Search products
router.get('/search/:query', productController.searchProducts);

// Create new product (protected route)
router.post('/', authMiddleware.verifyToken, productController.createProduct);

// Update product (protected route)
router.put('/:id', authMiddleware.verifyToken, productController.updateProduct);

// Delete product (protected route)
router.delete('/:id', authMiddleware.verifyToken, productController.deleteProduct);

// Get product reviews
router.get('/:id/reviews', productController.getProductReviews);

// Add product review (protected route)
router.post('/:id/reviews', authMiddleware.verifyToken, productController.addProductReview);

module.exports = router;
