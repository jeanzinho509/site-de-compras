-- Add role field to users table

USE hteasy_db;

-- Add role column to users table if it doesn't exist
ALTER TABLE users
ADD COLUMN role ENUM('user', 'admin', 'seller') NOT NULL DEFAULT 'user' AFTER email;

-- Create an index on the role column for faster lookups
CREATE INDEX idx_users_role ON users(role);

-- Update the test user to be an admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'test@example.com';

-- Create a new admin user if one doesn't exist
INSERT INTO users (name, email, role, password, phone)
SELECT 'Admin User', 'admin@hteasy.com', 'admin', '$2b$10$6j7NZ/z3TQNNQUFJf3l1IeZ9Kw0CuRCF4yGwZP3MHzNxfRXJE5Oma', '123-456-7890'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@hteasy.com');