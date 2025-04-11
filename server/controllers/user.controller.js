const { pool } = require('../config/db');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [users] = await pool.query(
      'SELECT id, name, email, phone, created_at FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ user: users[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone } = req.body;
    
    // Update user in database
    await pool.query(
      'UPDATE users SET name = ?, phone = ? WHERE id = ?',
      [name, phone, userId]
    );
    
    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};

// Get user addresses
exports.getAddresses = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [addresses] = await pool.query(
      'SELECT * FROM addresses WHERE user_id = ?',
      [userId]
    );
    
    res.status(200).json({ addresses });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({ message: 'Server error while fetching addresses' });
  }
};

// Add new address
exports.addAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      address_line1,
      address_line2,
      city,
      state,
      postal_code,
      country,
      is_default,
      address_type
    } = req.body;
    
    // Validate required fields
    if (!address_line1 || !city || !state || !postal_code || !country || !address_type) {
      return res.status(400).json({ message: 'Please provide all required address fields' });
    }
    
    // If this is a default address, unset any existing default of the same type
    if (is_default) {
      await pool.query(
        'UPDATE addresses SET is_default = FALSE WHERE user_id = ? AND address_type = ?',
        [userId, address_type]
      );
    }
    
    // Insert address into database
    const [result] = await pool.query(
      `INSERT INTO addresses 
       (user_id, address_line1, address_line2, city, state, postal_code, country, is_default, address_type) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, address_line1, address_line2, city, state, postal_code, country, is_default, address_type]
    );
    
    res.status(201).json({
      message: 'Address added successfully',
      address_id: result.insertId
    });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({ message: 'Server error while adding address' });
  }
};

// Update address
exports.updateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;
    const {
      address_line1,
      address_line2,
      city,
      state,
      postal_code,
      country,
      is_default,
      address_type
    } = req.body;
    
    // Check if address belongs to user
    const [addresses] = await pool.query(
      'SELECT * FROM addresses WHERE id = ? AND user_id = ?',
      [addressId, userId]
    );
    
    if (addresses.length === 0) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    // If this is a default address, unset any existing default of the same type
    if (is_default) {
      await pool.query(
        'UPDATE addresses SET is_default = FALSE WHERE user_id = ? AND address_type = ? AND id != ?',
        [userId, address_type, addressId]
      );
    }
    
    // Update address in database
    await pool.query(
      `UPDATE addresses SET 
       address_line1 = ?, address_line2 = ?, city = ?, state = ?, 
       postal_code = ?, country = ?, is_default = ?, address_type = ? 
       WHERE id = ? AND user_id = ?`,
      [address_line1, address_line2, city, state, postal_code, country, is_default, address_type, addressId, userId]
    );
    
    res.status(200).json({ message: 'Address updated successfully' });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ message: 'Server error while updating address' });
  }
};

// Delete address
exports.deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;
    
    // Check if address belongs to user
    const [addresses] = await pool.query(
      'SELECT * FROM addresses WHERE id = ? AND user_id = ?',
      [addressId, userId]
    );
    
    if (addresses.length === 0) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    // Delete address from database
    await pool.query(
      'DELETE FROM addresses WHERE id = ? AND user_id = ?',
      [addressId, userId]
    );
    
    res.status(200).json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ message: 'Server error while deleting address' });
  }
};

// Get user orders
exports.getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    
    res.status(200).json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
};

// Get specific order details
exports.getOrderDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;
    
    // Get order
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [orderId, userId]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const order = orders[0];
    
    // Get order items
    const [orderItems] = await pool.query(
      `SELECT oi.*, p.title, p.image_url 
       FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = ?`,
      [orderId]
    );
    
    // Get shipping address
    const [shippingAddresses] = await pool.query(
      'SELECT * FROM addresses WHERE id = ?',
      [order.shipping_address_id]
    );
    
    // Get billing address
    const [billingAddresses] = await pool.query(
      'SELECT * FROM addresses WHERE id = ?',
      [order.billing_address_id]
    );
    
    res.status(200).json({
      order,
      items: orderItems,
      shipping_address: shippingAddresses[0],
      billing_address: billingAddresses[0]
    });
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({ message: 'Server error while fetching order details' });
  }
};
