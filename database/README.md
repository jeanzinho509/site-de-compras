# HTeasy Database Setup

This directory contains the database schema and initialization scripts for the HTeasy marketplace.

## Database Structure

The HTeasy database consists of the following tables:

- `users`: Store user account information
- `categories`: Store product categories
- `products`: Store product listings
- `product_images`: Store multiple images for each product
- `addresses`: Store shipping/billing addresses
- `orders`: Track customer orders
- `order_items`: Track items in each order
- `reviews`: Store product reviews
- `cart`: Store items in user's shopping cart
- `wishlist`: Store items in user's wishlist

## Setup Instructions

### Prerequisites

- MySQL Server (5.7 or higher)
- Node.js (14.x or higher)

### Steps to Set Up the Database

1. Install MySQL if you haven't already:
   - For Windows: Download and install from [MySQL Website](https://dev.mysql.com/downloads/installer/)
   - For Mac: `brew install mysql`
   - For Linux: `sudo apt install mysql-server`

2. Start MySQL service:
   - Windows: MySQL service should start automatically after installation
   - Mac: `brew services start mysql`
   - Linux: `sudo systemctl start mysql`

3. Log in to MySQL:
   ```
   mysql -u root -p
   ```

4. Create the database and tables:
   ```
   source /path/to/schema.sql
   ```

5. Initialize the database with sample data:
   ```
   source /path/to/init.sql
   ```

6. Update the `.env` file with your MySQL credentials:
   ```
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=hteasy_db
   ```

## Connecting to the Database

The application uses the `mysql2` package to connect to the MySQL database. The connection is configured in `server/config/db.js`.

## API Endpoints

The following API endpoints are available for interacting with the database:

### Authentication
- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login user
- `POST /api/auth/forgot-password`: Request password reset
- `POST /api/auth/reset-password`: Reset password

### Users
- `GET /api/users/profile`: Get user profile
- `PUT /api/users/profile`: Update user profile
- `GET /api/users/addresses`: Get user addresses
- `POST /api/users/addresses`: Add new address
- `PUT /api/users/addresses/:id`: Update address
- `DELETE /api/users/addresses/:id`: Delete address
- `GET /api/users/orders`: Get user orders
- `GET /api/users/orders/:id`: Get specific order details

### Products
- `GET /api/products`: Get all products
- `GET /api/products/:id`: Get product by ID
- `GET /api/products/category/:categoryId`: Get products by category
- `GET /api/products/search/:query`: Search products
- `POST /api/products`: Create new product
- `PUT /api/products/:id`: Update product
- `DELETE /api/products/:id`: Delete product
- `GET /api/products/:id/reviews`: Get product reviews
- `POST /api/products/:id/reviews`: Add product review

### Categories
- `GET /api/categories`: Get all categories
- `GET /api/categories/:id`: Get category by ID
- `POST /api/categories`: Create new category (admin only)
- `PUT /api/categories/:id`: Update category (admin only)
- `DELETE /api/categories/:id`: Delete category (admin only)
