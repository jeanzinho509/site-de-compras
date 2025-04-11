-- HTeasy Initial Data

USE hteasy_db;

-- Insert Categories
INSERT INTO categories (name, description, image_url) VALUES 
('Electronics', 'Electronic devices and gadgets', 'assets/electronics.jpg'),
('Fashion', 'Clothing, shoes, and accessories', 'assets/fashion.jpg'),
('Home', 'Home goods and furniture', 'assets/home.jpg'),
('Vehicles', 'Cars, motorcycles, and parts', NULL);

-- Insert a test user (password: password123)
INSERT INTO users (name, email, password, phone) VALUES 
('Test User', 'test@example.com', '$2b$10$6j7NZ/z3TQNNQUFJf3l1IeZ9Kw0CuRCF4yGwZP3MHzNxfRXJE5Oma', '123-456-7890');

-- Insert sample products
INSERT INTO products (title, description, price, quantity, category_id, seller_id, image_url) VALUES 
('Smartphone X', 'Latest smartphone with advanced features', 699.99, 50, 1, 1, 'assets/electronics.jpg'),
('Laptop Pro', 'High-performance laptop for professionals', 1299.99, 25, 1, 1, 'assets/electronics.jpg'),
('Designer T-shirt', 'Premium cotton t-shirt', 29.99, 100, 2, 1, 'assets/fashion.jpg'),
('Leather Jacket', 'Genuine leather jacket', 199.99, 20, 2, 1, 'assets/fashion.jpg'),
('Coffee Table', 'Modern design coffee table', 149.99, 15, 3, 1, 'assets/home.jpg'),
('Bed Frame', 'Queen size bed frame', 299.99, 10, 3, 1, 'assets/home.jpg');

-- Insert product images
INSERT INTO product_images (product_id, image_url, is_primary) VALUES 
(1, 'assets/electronics.jpg', TRUE),
(2, 'assets/electronics.jpg', TRUE),
(3, 'assets/fashion.jpg', TRUE),
(4, 'assets/fashion.jpg', TRUE),
(5, 'assets/home.jpg', TRUE),
(6, 'assets/home.jpg', TRUE);

-- Insert sample reviews
INSERT INTO reviews (product_id, user_id, rating, comment) VALUES 
(1, 1, 5, 'Great smartphone, very fast and excellent camera!'),
(2, 1, 4, 'Good laptop, but battery life could be better'),
(3, 1, 5, 'Perfect fit and comfortable material');
