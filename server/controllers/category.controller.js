const { pool } = require('../config/db');

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const [categories] = await pool.query(
      'SELECT * FROM categories ORDER BY name'
    );
    
    res.status(200).json({ categories });
  } catch (error) {
    console.error('Get all categories error:', error);
    res.status(500).json({ message: 'Server error while fetching categories' });
  }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const categoryId = req.params.id;
    
    // Get category
    const [categories] = await pool.query(
      'SELECT * FROM categories WHERE id = ?',
      [categoryId]
    );
    
    if (categories.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    const category = categories[0];
    
    // Get subcategories if any
    const [subcategories] = await pool.query(
      'SELECT * FROM categories WHERE parent_id = ?',
      [categoryId]
    );
    
    // Get product count in this category
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as product_count FROM products WHERE category_id = ? AND status = "active"',
      [categoryId]
    );
    
    res.status(200).json({
      category,
      subcategories,
      product_count: countResult[0].product_count
    });
  } catch (error) {
    console.error('Get category by ID error:', error);
    res.status(500).json({ message: 'Server error while fetching category' });
  }
};

// Create new category (admin only)
exports.createCategory = async (req, res) => {
  try {
    const { name, description, image_url, parent_id } = req.body;
    
    // Validate input
    if (!name) {
      return res.status(400).json({ message: 'Please provide a category name' });
    }
    
    // Check if category with same name already exists
    const [existingCategories] = await pool.query(
      'SELECT * FROM categories WHERE name = ?',
      [name]
    );
    
    if (existingCategories.length > 0) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }
    
    // Insert category into database
    const [result] = await pool.query(
      'INSERT INTO categories (name, description, image_url, parent_id) VALUES (?, ?, ?, ?)',
      [name, description, image_url, parent_id]
    );
    
    res.status(201).json({
      message: 'Category created successfully',
      category_id: result.insertId
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Server error while creating category' });
  }
};

// Update category (admin only)
exports.updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { name, description, image_url, parent_id } = req.body;
    
    // Check if category exists
    const [categories] = await pool.query(
      'SELECT * FROM categories WHERE id = ?',
      [categoryId]
    );
    
    if (categories.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if new parent would create a circular reference
    if (parent_id) {
      // Cannot set parent to self
      if (parseInt(parent_id) === parseInt(categoryId)) {
        return res.status(400).json({ message: 'Category cannot be its own parent' });
      }
      
      // Check if new parent is actually a child of this category
      const checkCircularRef = async (parentId, targetId) => {
        if (!parentId) return false;
        
        const [parents] = await pool.query(
          'SELECT * FROM categories WHERE id = ?',
          [parentId]
        );
        
        if (parents.length === 0) return false;
        
        if (parseInt(parents[0].parent_id) === parseInt(targetId)) return true;
        
        if (parents[0].parent_id) {
          return await checkCircularRef(parents[0].parent_id, targetId);
        }
        
        return false;
      };
      
      const isCircular = await checkCircularRef(parent_id, categoryId);
      
      if (isCircular) {
        return res.status(400).json({ message: 'Cannot create circular category reference' });
      }
    }
    
    // Update category in database
    await pool.query(
      'UPDATE categories SET name = ?, description = ?, image_url = ?, parent_id = ? WHERE id = ?',
      [name, description, image_url, parent_id, categoryId]
    );
    
    res.status(200).json({ message: 'Category updated successfully' });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Server error while updating category' });
  }
};

// Delete category (admin only)
exports.deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    
    // Check if category exists
    const [categories] = await pool.query(
      'SELECT * FROM categories WHERE id = ?',
      [categoryId]
    );
    
    if (categories.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if category has subcategories
    const [subcategories] = await pool.query(
      'SELECT * FROM categories WHERE parent_id = ?',
      [categoryId]
    );
    
    if (subcategories.length > 0) {
      return res.status(400).json({ message: 'Cannot delete category with subcategories' });
    }
    
    // Check if category has products
    const [products] = await pool.query(
      'SELECT * FROM products WHERE category_id = ? LIMIT 1',
      [categoryId]
    );
    
    if (products.length > 0) {
      return res.status(400).json({ message: 'Cannot delete category with products' });
    }
    
    // Delete category from database
    await pool.query(
      'DELETE FROM categories WHERE id = ?',
      [categoryId]
    );
    
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error while deleting category' });
  }
};
