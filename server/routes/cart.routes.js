const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All cart routes are protected and require authentication
router.use(authMiddleware.verifyToken);

// Get user's cart items
router.get('/', cartController.getCart);

// Add product to cart
router.post('/', cartController.addToCart);

// Update cart item quantity
router.put('/', cartController.updateCartItem);

// Remove product from cart
router.delete('/:productId', cartController.removeFromCart);

// Clear cart (remove all items)
router.delete('/', cartController.clearCart);

module.exports = router;