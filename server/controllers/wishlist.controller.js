const { pool } = require('../config/db');

// Get user's wishlist items
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get wishlist items with product details
    const [wishlistItems] = await pool.query(
      `SELECT w.id, w.product_id, w.created_at,
       p.title, p.price, p.discount_price, p.image_url, p.quantity as stock
       FROM wishlist w
       JOIN products p ON w.product_id = p.id
       WHERE w.user_id = ? AND p.status = 'active'
       ORDER BY w.created_at DESC`,
      [userId]
    );
    
    res.status(200).json({
      wishlistItems,
      totalItems: wishlistItems.length
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ message: 'Server error while fetching wishlist' });
  }
};

// Add product to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;
    
    // Validate input
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }
    
    // Check if product exists and is active
    const [products] = await pool.query(
      'SELECT * FROM products WHERE id = ? AND status = "active"',
      [productId]
    );
    
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found or unavailable' });
    }
    
    // Check if product is already in wishlist
    const [existingWishlistItems] = await pool.query(
      'SELECT * FROM wishlist WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );
    
    if (existingWishlistItems.length > 0) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }
    
    // Add product to wishlist
    await pool.query(
      'INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)',
      [userId, productId]
    );
    
    res.status(201).json({ 
      message: 'Product added to wishlist successfully',
      wishlistItem: {
        product_id: productId
      }
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ message: 'Server error while adding to wishlist' });
  }
};

// Remove product from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.productId;
    
    // Validate input
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }
    
    // Check if product is in wishlist
    const [existingWishlistItems] = await pool.query(
      'SELECT * FROM wishlist WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );
    
    if (existingWishlistItems.length === 0) {
      return res.status(404).json({ message: 'Product not found in wishlist' });
    }
    
    // Remove product from wishlist
    await pool.query(
      'DELETE FROM wishlist WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );
    
    res.status(200).json({ message: 'Product removed from wishlist successfully' });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ message: 'Server error while removing from wishlist' });
  }
};

// Move product from wishlist to cart
exports.moveToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;
    
    // Validate input
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }
    
    // Check if product exists and is active
    const [products] = await pool.query(
      'SELECT * FROM products WHERE id = ? AND status = "active"',
      [productId]
    );
    
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found or unavailable' });
    }
    
    const product = products[0];
    
    // Check if product is in stock
    if (product.quantity < quantity) {
      return res.status(400).json({ message: 'Not enough stock available' });
    }
    
    // Check if product is in wishlist
    const [existingWishlistItems] = await pool.query(
      'SELECT * FROM wishlist WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );
    
    if (existingWishlistItems.length === 0) {
      return res.status(404).json({ message: 'Product not found in wishlist' });
    }
    
    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Check if product is already in cart
      const [existingCartItems] = await connection.query(
        'SELECT * FROM cart WHERE user_id = ? AND product_id = ?',
        [userId, productId]
      );
      
      if (existingCartItems.length > 0) {
        // Update quantity if product already in cart
        const newQuantity = existingCartItems[0].quantity + quantity;
        
        // Check if new quantity exceeds stock
        if (newQuantity > product.quantity) {
          await connection.rollback();
          connection.release();
          return res.status(400).json({ message: 'Not enough stock available' });
        }
        
        await connection.query(
          'UPDATE cart SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND product_id = ?',
          [newQuantity, userId, productId]
        );
      } else {
        // Add new item to cart
        await connection.query(
          'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
          [userId, productId, quantity]
        );
      }
      
      // Remove from wishlist
      await connection.query(
        'DELETE FROM wishlist WHERE user_id = ? AND product_id = ?',
        [userId, productId]
      );
      
      // Commit the transaction
      await connection.commit();
      
      res.status(200).json({ 
        message: 'Product moved from wishlist to cart successfully',
        cartItem: {
          product_id: productId,
          quantity: existingCartItems.length > 0 ? existingCartItems[0].quantity + quantity : quantity
        }
      });
    } catch (error) {
      // Rollback in case of error
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Move to cart error:', error);
    res.status(500).json({ message: 'Server error while moving product to cart' });
  }
};

// Clear wishlist (remove all items)
exports.clearWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Remove all products from wishlist
    await pool.query(
      'DELETE FROM wishlist WHERE user_id = ?',
      [userId]
    );
    
    res.status(200).json({ message: 'Wishlist cleared successfully' });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({ message: 'Server error while clearing wishlist' });
  }
};