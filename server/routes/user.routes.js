const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Get user profile (protected route)
router.get('/profile', authMiddleware.verifyToken, userController.getProfile);

// Update user profile (protected route)
router.put('/profile', authMiddleware.verifyToken, userController.updateProfile);

// Get user addresses (protected route)
router.get('/addresses', authMiddleware.verifyToken, userController.getAddresses);

// Add new address (protected route)
router.post('/addresses', authMiddleware.verifyToken, userController.addAddress);

// Update address (protected route)
router.put('/addresses/:id', authMiddleware.verifyToken, userController.updateAddress);

// Delete address (protected route)
router.delete('/addresses/:id', authMiddleware.verifyToken, userController.deleteAddress);

// Get user orders (protected route)
router.get('/orders', authMiddleware.verifyToken, userController.getOrders);

// Get specific order details (protected route)
router.get('/orders/:id', authMiddleware.verifyToken, userController.getOrderDetails);

module.exports = router;
