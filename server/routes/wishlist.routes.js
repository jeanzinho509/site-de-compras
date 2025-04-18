const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlist.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All wishlist routes are protected and require authentication
router.use(authMiddleware.verifyToken);

// Get user's wishlist items
router.get('/', wishlistController.getWishlist);

// Add product to wishlist
router.post('/', wishlistController.addToWishlist);

// Remove product from wishlist
router.delete('/:productId', wishlistController.removeFromWishlist);

// Move product from wishlist to cart
router.post('/move-to-cart', wishlistController.moveToCart);

// Clear wishlist (remove all items)
router.delete('/', wishlistController.clearWishlist);

module.exports = router;