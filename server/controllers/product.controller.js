const { pool } = require('../config/db');

// Get all products with pagination
exports.getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Extract filter parameters
    const minPrice = req.query.min_price ? parseFloat(req.query.min_price) : null;
    const maxPrice = req.query.max_price ? parseFloat(req.query.max_price) : null;
    const minRating = req.query.min_rating ? parseFloat(req.query.min_rating) : null;
    const inStock = req.query.in_stock === 'true';
    const sortBy = ['title', 'price', 'created_at', 'average_rating'].includes(req.query.sort_by) 
      ? req.query.sort_by 
      : 'created_at';
    const sortOrder = req.query.sort_order === 'asc' ? 'ASC' : 'DESC';
    
    // Build query conditions
    let conditions = ['p.status = "active"'];
    let params = [];
    
    if (minPrice !== null) {
      conditions.push('p.price >= ?');
      params.push(minPrice);
    }
    
    if (maxPrice !== null) {
      conditions.push('p.price <= ?');
      params.push(maxPrice);
    }
    
    if (inStock) {
      conditions.push('p.quantity > 0');
    }
    
    // Build the query
    let query = `
      SELECT p.*, c.name as category_name, 
      (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id) as review_count,
      (SELECT AVG(rating) FROM reviews r WHERE r.product_id = p.id) as average_rating
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${conditions.join(' AND ')}
    `;
    
    // Add having clause for rating filter if needed
    if (minRating !== null) {
      query += ` HAVING average_rating >= ?`;
      params.push(minRating);
    }
    
    // Add sorting
    if (sortBy === 'average_rating') {
      query += ` ORDER BY average_rating ${sortOrder}, p.created_at DESC`;
    } else {
      query += ` ORDER BY p.${sortBy} ${sortOrder}`;
    }
    
    // Add pagination
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    
    // Execute the query
    const [products] = await pool.query(query, params);
    
    // Build count query with the same conditions
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM products p
      WHERE ${conditions.join(' AND ')}
    `;
    
    let countParams = [...params.slice(0, params.length - 2)]; // Remove limit and offset
    
    // Execute count query
    const [countResult] = await pool.query(countQuery, countParams);
    
    // If we have a rating filter, we need to count manually
    let totalProducts = countResult[0].total;
    
    if (minRating !== null) {
      // Count products that meet the rating criteria
      const filteredProducts = await Promise.all(products.map(async (product) => {
        const [ratingResult] = await pool.query(
          'SELECT AVG(rating) as avg_rating FROM reviews WHERE product_id = ?',
          [product.id]
        );
        return ratingResult[0].avg_rating >= minRating ? product : null;
      }));
      
      totalProducts = filteredProducts.filter(p => p !== null).length;
    }
    
    const totalPages = Math.ceil(totalProducts / limit);
    
    res.status(200).json({
      products,
      pagination: {
        total: totalProducts,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({ message: 'Server error while fetching products' });
  }
};
// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Get product details
    const [products] = await pool.query(
      `SELECT p.*, c.name as category_name, u.name as seller_name,
       (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id) as review_count,
       (SELECT AVG(rating) FROM reviews r WHERE r.product_id = p.id) as average_rating
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN users u ON p.seller_id = u.id
       WHERE p.id = ? AND p.status = 'active'`,
      [productId]
    );
    
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const product = products[0];
    
    // Get product images
    const [images] = await pool.query(
      'SELECT * FROM product_images WHERE product_id = ?',
      [productId]
    );
    
    // Get product reviews
    const [reviews] = await pool.query(
      `SELECT r.*, u.name as user_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC
       LIMIT 5`,
      [productId]
    );
    
    res.status(200).json({
      product,
      images,
      reviews
    });
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({ message: 'Server error while fetching product' });
  }
};
// Get products by category
exports.getProductsByCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Extract filter parameters
    const minPrice = req.query.min_price ? parseFloat(req.query.min_price) : null;
    const maxPrice = req.query.max_price ? parseFloat(req.query.max_price) : null;
    const minRating = req.query.min_rating ? parseFloat(req.query.min_rating) : null;
    const inStock = req.query.in_stock === 'true';
    const sortBy = ['title', 'price', 'created_at', 'average_rating'].includes(req.query.sort_by) 
      ? req.query.sort_by 
      : 'created_at';
    const sortOrder = req.query.sort_order === 'asc' ? 'ASC' : 'DESC';
    
    // Build query conditions
    let conditions = ['p.category_id = ? AND p.status = "active"'];
    let params = [categoryId];
    
    if (minPrice !== null) {
      conditions.push('p.price >= ?');
      params.push(minPrice);
    }
    
    if (maxPrice !== null) {
      conditions.push('p.price <= ?');
      params.push(maxPrice);
    }
    
    if (inStock) {
      conditions.push('p.quantity > 0');
    }
    
    // Build the query
    let query = `
      SELECT p.*, c.name as category_name, 
      (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id) as review_count,
      (SELECT AVG(rating) FROM reviews r WHERE r.product_id = p.id) as average_rating
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${conditions.join(' AND ')}
    `;
    
    // Add having clause for rating filter if needed
    if (minRating !== null) {
      query += ` HAVING average_rating >= ?`;
      params.push(minRating);
    }
    
    // Add sorting
    if (sortBy === 'average_rating') {
      query += ` ORDER BY average_rating ${sortOrder}, p.created_at DESC`;
    } else {
      query += ` ORDER BY p.${sortBy} ${sortOrder}`;
    }
    
    // Add pagination
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    
    // Execute the query
    const [products] = await pool.query(query, params);
    
    // Build count query with the same conditions
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM products p
      WHERE ${conditions.join(' AND ')}
    `;
    
    let countParams = [...params.slice(0, params.length - 2)]; // Remove limit and offset
    
    // Execute count query
    const [countResult] = await pool.query(countQuery, countParams);
    
    // If we have a rating filter, we need to count manually
    let totalProducts = countResult[0].total;
    
    if (minRating !== null) {
      // Count products that meet the rating criteria
      const filteredProducts = await Promise.all(products.map(async (product) => {
        const [ratingResult] = await pool.query(
          'SELECT AVG(rating) as avg_rating FROM reviews WHERE product_id = ?',
          [product.id]
        );
        return ratingResult[0].avg_rating >= minRating ? product : null;
      }));
      
      totalProducts = filteredProducts.filter(p => p !== null).length;
    }
    
    const totalPages = Math.ceil(totalProducts / limit);
    
    res.status(200).json({
      products,
      pagination: {
        total: totalProducts,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({ message: 'Server error while fetching products by category' });
  }
};

// Search products
exports.searchProducts = async (req, res) => {
  try {
    const searchQuery = req.params.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Extract filter parameters
    const minPrice = req.query.min_price ? parseFloat(req.query.min_price) : null;
    const maxPrice = req.query.max_price ? parseFloat(req.query.max_price) : null;
    const minRating = req.query.min_rating ? parseFloat(req.query.min_rating) : null;
    const inStock = req.query.in_stock === 'true';
    const categoryId = req.query.category_id ? parseInt(req.query.category_id) : null;
    const sortBy = ['title', 'price', 'created_at', 'average_rating'].includes(req.query.sort_by) 
      ? req.query.sort_by 
      : 'created_at';
    const sortOrder = req.query.sort_order === 'asc' ? 'ASC' : 'DESC';
    
    // Build query conditions
    let conditions = ['p.status = "active"'];
    let params = [];
    
    // Search in title, description, and category name
    conditions.push('(p.title LIKE ? OR p.description LIKE ? OR c.name LIKE ?)');
    params.push(`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`);
    
    if (categoryId !== null) {
      conditions.push('p.category_id = ?');
      params.push(categoryId);
    }
    
    if (minPrice !== null) {
      conditions.push('p.price >= ?');
      params.push(minPrice);
    }
    
    if (maxPrice !== null) {
      conditions.push('p.price <= ?');
      params.push(maxPrice);
    }
    
    if (inStock) {
      conditions.push('p.quantity > 0');
    }
    
    // Build the query
    let query = `
      SELECT p.*, c.name as category_name, 
      (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id) as review_count,
      (SELECT AVG(rating) FROM reviews r WHERE r.product_id = p.id) as average_rating
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${conditions.join(' AND ')}
    `;
    
    // Add having clause for rating filter if needed
    if (minRating !== null) {
      query += ` HAVING average_rating >= ?`;
      params.push(minRating);
    }
    
    // Add sorting
    if (sortBy === 'average_rating') {
      query += ` ORDER BY average_rating ${sortOrder}, p.created_at DESC`;
    } else {
      query += ` ORDER BY p.${sortBy} ${sortOrder}`;
    }
    
    // Add pagination
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    
    // Execute the query
    const [products] = await pool.query(query, params);
    
    // Build count query with the same conditions
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${conditions.join(' AND ')}
    `;
    
    let countParams = [...params.slice(0, params.length - 2)]; // Remove limit and offset
    
    // Execute count query
    const [countResult] = await pool.query(countQuery, countParams);
    
    // If we have a rating filter, we need to count manually
    let totalProducts = countResult[0].total;
    
    if (minRating !== null) {
      // Count products that meet the rating criteria
      const filteredProducts = await Promise.all(products.map(async (product) => {
        const [ratingResult] = await pool.query(
          'SELECT AVG(rating) as avg_rating FROM reviews WHERE product_id = ?',
          [product.id]
        );
        return ratingResult[0].avg_rating >= minRating ? product : null;
      }));
      
      totalProducts = filteredProducts.filter(p => p !== null).length;
    }
    
    const totalPages = Math.ceil(totalProducts / limit);
    
    res.status(200).json({
      products,
      pagination: {
        total: totalProducts,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({ message: 'Server error while searching products' });
  }
};

// Create new product
exports.createProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      title,
      description,
      price,
      discount_price,
      quantity,
      category_id,
      image_url,
      images
    } = req.body;
    
    // Validate required fields
    if (!title || !price || !quantity || !category_id) {
      return res.status(400).json({ message: 'Please provide all required product fields' });
    }
    
    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Insert product into database
      const [result] = await connection.query(
        `INSERT INTO products 
         (title, description, price, discount_price, quantity, category_id, seller_id, image_url) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, description, price, discount_price, quantity, category_id, userId, image_url]
      );
      
      const productId = result.insertId;
      
      // Insert product images if provided
      if (images && images.length > 0) {
        const imageValues = images.map((img, index) => [
          productId,
          img.url,
          index === 0 // First image is primary
        ]);
        
        await connection.query(
          'INSERT INTO product_images (product_id, image_url, is_primary) VALUES ?',
          [imageValues]
        );
      } else if (image_url) {
        // Insert the main image as a product image
        await connection.query(
          'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)',
          [productId, image_url, true]
        );
      }
      
      // Commit the transaction
      await connection.commit();
      
      res.status(201).json({
        message: 'Product created successfully',
        product_id: productId
      });
    } catch (error) {
      // Rollback in case of error
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error while creating product' });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.id;
    const {
      title,
      description,
      price,
      discount_price,
      quantity,
      category_id,
      image_url,
      status
    } = req.body;
    
    // Check if product exists and belongs to user
    const [products] = await pool.query(
      'SELECT * FROM products WHERE id = ? AND seller_id = ?',
      [productId, userId]
    );
    
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found or you do not have permission to update it' });
    }
    
    // Update product in database
    await pool.query(
      `UPDATE products SET 
       title = ?, description = ?, price = ?, discount_price = ?, 
       quantity = ?, category_id = ?, image_url = ?, status = ? 
       WHERE id = ? AND seller_id = ?`,
      [title, description, price, discount_price, quantity, category_id, image_url, status, productId, userId]
    );
    
    res.status(200).json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error while updating product' });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.id;
    
    // Check if product exists and belongs to user
    const [products] = await pool.query(
      'SELECT * FROM products WHERE id = ? AND seller_id = ?',
      [productId, userId]
    );
    
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found or you do not have permission to delete it' });
    }
    
    // Soft delete by updating status
    await pool.query(
      'UPDATE products SET status = "deleted" WHERE id = ? AND seller_id = ?',
      [productId, userId]
    );
    
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error while deleting product' });
  }
};

// Get product reviews
exports.getProductReviews = async (req, res) => {
  try {
    const productId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Get reviews with pagination
    const [reviews] = await pool.query(
      `SELECT r.*, u.name as user_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [productId, limit, offset]
    );
    
    // Get total count for pagination
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM reviews WHERE product_id = ?',
      [productId]
    );
    
    const totalReviews = countResult[0].total;
    const totalPages = Math.ceil(totalReviews / limit);
    
    // Get average rating
    const [ratingResult] = await pool.query(
      'SELECT AVG(rating) as average_rating FROM reviews WHERE product_id = ?',
      [productId]
    );
    
    res.status(200).json({
      reviews,
      average_rating: ratingResult[0].average_rating || 0,
      pagination: {
        total: totalReviews,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    console.error('Get product reviews error:', error);
    res.status(500).json({ message: 'Server error while fetching product reviews' });
  }
};

// Add product review
exports.addProductReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.id;
    const { rating, comment } = req.body;
    
    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Please provide a valid rating between 1 and 5' });
    }
    
    // Check if product exists
    const [products] = await pool.query(
      'SELECT * FROM products WHERE id = ? AND status = "active"',
      [productId]
    );
    
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if user has already reviewed this product
    const [existingReviews] = await pool.query(
      'SELECT * FROM reviews WHERE product_id = ? AND user_id = ?',
      [productId, userId]
    );
    
    if (existingReviews.length > 0) {
      // Update existing review
      await pool.query(
        'UPDATE reviews SET rating = ?, comment = ?, updated_at = CURRENT_TIMESTAMP WHERE product_id = ? AND user_id = ?',
        [rating, comment, productId, userId]
      );
      
      res.status(200).json({ message: 'Review updated successfully' });
    } else {
      // Insert new review
      await pool.query(
        'INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
        [productId, userId, rating, comment]
      );
      
      res.status(201).json({ message: 'Review added successfully' });
    }
  } catch (error) {
    console.error('Add product review error:', error);
    res.status(500).json({ message: 'Server error while adding product review' });
  }
};
