const { pool } = require('../config/db');

// Get user's cart items
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get cart items with product details
    const [cartItems] = await pool.query(
      `SELECT c.id, c.product_id, c.quantity, c.created_at, c.updated_at,
       p.title, p.price, p.discount_price, p.image_url,
       (p.price * c.quantity) as total_price,
       (CASE WHEN p.discount_price IS NOT NULL THEN (p.discount_price * c.quantity) ELSE NULL END) as total_discount_price
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ? AND p.status = 'active'
       ORDER BY c.created_at DESC`,
      [userId]
    );
    
    // Calculate cart totals
    let cartTotal = 0;
    let cartDiscountTotal = 0;
    
    cartItems.forEach(item => {
      if (item.discount_price) {
        cartDiscountTotal += parseFloat(item.total_discount_price);
      } else {
        cartTotal += parseFloat(item.total_price);
      }
    });
    
    const finalTotal = cartTotal + cartDiscountTotal;
    
    res.status(200).json({
      cartItems,
      cartSummary: {
        totalItems: cartItems.length,
        subtotal: cartTotal,
        discountTotal: cartDiscountTotal,
        finalTotal: finalTotal
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Server error while fetching cart' });
  }
};

// Add product to cart
exports.addToCart = async (req, res) => {
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
    
    // Check if product is already in cart
    const [existingCartItems] = await pool.query(
      'SELECT * FROM cart WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );
    
    if (existingCartItems.length > 0) {
      // Update quantity if product already in cart
      const newQuantity = existingCartItems[0].quantity + quantity;
      
      // Check if new quantity exceeds stock
      if (newQuantity > product.quantity) {
        return res.status(400).json({ message: 'Not enough stock available' });
      }
      
      await pool.query(
        'UPDATE cart SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND product_id = ?',
        [newQuantity, userId, productId]
      );
      
      res.status(200).json({ 
        message: 'Cart updated successfully',
        cartItem: {
          product_id: productId,
          quantity: newQuantity
        }
      });
    } else {
      // Add new item to cart
      await pool.query(
        'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [userId, productId, quantity]
      );
      
      res.status(201).json({ 
        message: 'Product added to cart successfully',
        cartItem: {
          product_id: productId,
          quantity: quantity
        }
      });
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Server error while adding to cart' });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;
    
    // Validate input
    if (!productId || !quantity) {
      return res.status(400).json({ message: 'Product ID and quantity are required' });
    }
    
    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
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
    
    // Check if product is in cart
    const [existingCartItems] = await pool.query(
      'SELECT * FROM cart WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );
    
    if (existingCartItems.length === 0) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }
    
    // Update cart item quantity
    await pool.query(
      'UPDATE cart SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND product_id = ?',
      [quantity, userId, productId]
    );
    
    res.status(200).json({ 
      message: 'Cart updated successfully',
      cartItem: {
        product_id: productId,
        quantity: quantity
      }
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Server error while updating cart' });
  }
};

// Remove product from cart
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.productId;
    
    // Validate input
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }
    
    // Check if product is in cart
    const [existingCartItems] = await pool.query(
      'SELECT * FROM cart WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );
    
    if (existingCartItems.length === 0) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }
    
    // Remove product from cart
    await pool.query(
      'DELETE FROM cart WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );
    
    res.status(200).json({ message: 'Product removed from cart successfully' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Server error while removing from cart' });
  }
};

// Clear cart (remove all items)
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Remove all products from cart
    await pool.query(
      'DELETE FROM cart WHERE user_id = ?',
      [userId]
    );
    
    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Server error while clearing cart' });
  }
};