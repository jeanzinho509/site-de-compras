// Admin Dashboard JavaScript

// API URL
const API_URL = '/api';

// DOM Elements
const navItems = document.querySelectorAll('.nav-item');
const contentSections = document.querySelectorAll('.content-section');
const logoutBtn = document.getElementById('logout-btn');
const adminName = document.getElementById('admin-name');

// Modal Elements
const productModal = document.getElementById('product-modal');
const categoryModal = document.getElementById('category-modal');
const userModal = document.getElementById('user-modal');
const orderModal = document.getElementById('order-modal');
const closeButtons = document.querySelectorAll('.close');

// Form Elements
const productForm = document.getElementById('product-form');
const categoryForm = document.getElementById('category-form');
const userForm = document.getElementById('user-form');
const generalSettingsForm = document.getElementById('general-settings-form');

// Button Elements
const addProductBtn = document.getElementById('add-product-btn');
const addCategoryBtn = document.getElementById('add-category-btn');
const addUserBtn = document.getElementById('add-user-btn');
const uploadImagesBtn = document.getElementById('upload-images-btn');
const uploadCategoryImageBtn = document.getElementById('upload-category-image-btn');

// Authentication Check
function checkAuth() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token || user.role !== 'admin') {
    // Redirect to login page if not authenticated or not admin
    window.location.href = '/sign-in.html';
    return false;
  }
  
  // Set admin name
  if (adminName) {
    adminName.textContent = user.name || 'Admin User';
  }
  
  return true;
}

// Navigation
function setupNavigation() {
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      // Remove active class from all items
      navItems.forEach(i => i.classList.remove('active'));
      
      // Add active class to clicked item
      item.classList.add('active');
      
      // Show corresponding section
      const section = item.getAttribute('data-section');
      contentSections.forEach(s => {
        s.classList.remove('active');
        if (s.id === `${section}-section`) {
          s.classList.add('active');
        }
      });
      
      // Load section data
      loadSectionData(section);
    });
  });
}

// Load section data
function loadSectionData(section) {
  switch (section) {
    case 'dashboard':
      loadDashboardData();
      break;
    case 'products':
      loadProducts();
      break;
    case 'categories':
      loadCategories();
      break;
    case 'orders':
      loadOrders();
      break;
    case 'users':
      loadUsers();
      break;
    case 'settings':
      // Settings are static for now
      break;
  }
}

// Dashboard Data
async function loadDashboardData() {
  try {
    const token = localStorage.getItem('token');
    
    // Get product count
    const productsResponse = await fetch(`${API_URL}/products?limit=1`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const productsData = await productsResponse.json();
    document.getElementById('total-products').textContent = productsData.pagination.total || 0;
    
    // Get user count
    const usersResponse = await fetch(`${API_URL}/users/count`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const usersData = await usersResponse.json();
    document.getElementById('total-users').textContent = usersData.count || 0;
    
    // Get order count
    const ordersResponse = await fetch(`${API_URL}/orders/count`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const ordersData = await ordersResponse.json();
    document.getElementById('total-orders').textContent = ordersData.count || 0;
    
    // Get revenue
    const revenueResponse = await fetch(`${API_URL}/orders/revenue`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const revenueData = await revenueResponse.json();
    document.getElementById('total-revenue').textContent = `$${revenueData.revenue.toFixed(2) || '0.00'}`;
    
    // Get recent activities
    const activitiesResponse = await fetch(`${API_URL}/activities`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const activitiesData = await activitiesResponse.json();
    
    const activitiesList = document.getElementById('recent-activities');
    if (activitiesData.activities && activitiesData.activities.length > 0) {
      activitiesList.innerHTML = '';
      activitiesData.activities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
          <p><strong>${activity.user}</strong> ${activity.action} ${activity.target} - ${formatDate(activity.timestamp)}</p>
        `;
        activitiesList.appendChild(activityItem);
      });
    } else {
      activitiesList.innerHTML = '<p>No recent activities</p>';
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    showNotification('Error loading dashboard data', 'error');
  }
}

// Products
async function loadProducts() {
  try {
    const token = localStorage.getItem('token');
    const categoryFilter = document.getElementById('category-filter').value;
    const statusFilter = document.getElementById('status-filter').value;
    
    let url = `${API_URL}/products?limit=10`;
    if (categoryFilter) url += `&category=${categoryFilter}`;
    if (statusFilter) url += `&status=${statusFilter}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    const productsList = document.getElementById('products-list');
    productsList.innerHTML = '';
    
    if (data.products && data.products.length > 0) {
      data.products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${product.id}</td>
          <td><img src="${product.image_url || 'https://via.placeholder.com/50'}" alt="${product.title}" width="50"></td>
          <td>${product.title}</td>
          <td>${product.category_name || 'Uncategorized'}</td>
          <td>$${product.price.toFixed(2)}</td>
          <td>${product.quantity}</td>
          <td><span class="status-badge ${product.status}">${product.status}</span></td>
          <td>
            <button class="btn btn-primary btn-sm edit-product" data-id="${product.id}"><i class="fas fa-edit"></i></button>
            <button class="btn btn-danger btn-sm delete-product" data-id="${product.id}"><i class="fas fa-trash"></i></button>
          </td>
        `;
        productsList.appendChild(row);
      });
      
      // Add event listeners to edit and delete buttons
      document.querySelectorAll('.edit-product').forEach(btn => {
        btn.addEventListener('click', () => editProduct(btn.getAttribute('data-id')));
      });
      
      document.querySelectorAll('.delete-product').forEach(btn => {
        btn.addEventListener('click', () => deleteProduct(btn.getAttribute('data-id')));
      });
      
      // Setup pagination
      setupPagination(data.pagination, 'products-pagination', loadProducts);
    } else {
      productsList.innerHTML = '<tr><td colspan="8" class="text-center">No products found</td></tr>';
    }
    
    // Load categories for filter
    loadCategoriesForSelect('category-filter');
  } catch (error) {
    console.error('Error loading products:', error);
    showNotification('Error loading products', 'error');
  }
}

// Load categories for select element
async function loadCategoriesForSelect(selectId) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/categories`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    const select = document.getElementById(selectId);
    const currentValue = select.value;
    
    // Keep the first option (All Categories)
    const firstOption = select.options[0];
    select.innerHTML = '';
    select.appendChild(firstOption);
    
    if (data.categories && data.categories.length > 0) {
      data.categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        select.appendChild(option);
      });
    }
    
    // Restore selected value
    if (currentValue) {
      select.value = currentValue;
    }
  } catch (error) {
    console.error('Error loading categories for select:', error);
  }
}

// Edit product
async function editProduct(productId) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/products/${productId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    const product = data.product;
    
    // Fill form with product data
    document.getElementById('product-id').value = product.id;
    document.getElementById('product-title').value = product.title;
    document.getElementById('product-description').value = product.description || '';
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-discount').value = product.discount_price || '';
    document.getElementById('product-quantity').value = product.quantity;
    document.getElementById('product-category').value = product.category_id || '';
    document.getElementById('product-status').value = product.status;
    
    // Show product images
    const imagePreview = document.getElementById('image-preview');
    imagePreview.innerHTML = '';
    
    if (data.images && data.images.length > 0) {
      data.images.forEach(image => {
        const imgContainer = document.createElement('div');
        imgContainer.className = 'image-container';
        imgContainer.innerHTML = `
          <img src="${image.image_url}" alt="Product Image">
          <button type="button" class="btn btn-danger btn-sm remove-image" data-id="${image.id}">
            <i class="fas fa-times"></i>
          </button>
        `;
        imagePreview.appendChild(imgContainer);
      });
      
      // Add event listeners to remove image buttons
      document.querySelectorAll('.remove-image').forEach(btn => {
        btn.addEventListener('click', () => removeProductImage(btn.getAttribute('data-id')));
      });
    }
    
    // Update modal title
    document.getElementById('product-modal-title').textContent = 'Edit Product';
    
    // Show modal
    productModal.style.display = 'block';
  } catch (error) {
    console.error('Error loading product for edit:', error);
    showNotification('Error loading product', 'error');
  }
}

// Delete product
async function deleteProduct(productId) {
  if (confirm('Are you sure you want to delete this product?')) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        showNotification('Product deleted successfully', 'success');
        loadProducts();
      } else {
        const data = await response.json();
        showNotification(data.message || 'Error deleting product', 'error');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      showNotification('Error deleting product', 'error');
    }
  }
}

// Remove product image
async function removeProductImage(imageId) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/products/images/${imageId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      // Remove image from preview
      const imageElement = document.querySelector(`.remove-image[data-id="${imageId}"]`).parentNode;
      imageElement.remove();
    } else {
      const data = await response.json();
      showNotification(data.message || 'Error removing image', 'error');
    }
  } catch (error) {
    console.error('Error removing product image:', error);
    showNotification('Error removing image', 'error');
  }
}

// Categories
async function loadCategories() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/categories`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    const categoriesList = document.getElementById('categories-list');
    categoriesList.innerHTML = '';
    
    if (data.categories && data.categories.length > 0) {
      data.categories.forEach(category => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${category.id}</td>
          <td><img src="${category.image_url || 'https://via.placeholder.com/50'}" alt="${category.name}" width="50"></td>
          <td>${category.name}</td>
          <td>${category.description || '-'}</td>
          <td>${category.parent_name || '-'}</td>
          <td>${category.product_count || 0}</td>
          <td>
            <button class="btn btn-primary btn-sm edit-category" data-id="${category.id}"><i class="fas fa-edit"></i></button>
            <button class="btn btn-danger btn-sm delete-category" data-id="${category.id}"><i class="fas fa-trash"></i></button>
          </td>
        `;
        categoriesList.appendChild(row);
      });
      
      // Add event listeners to edit and delete buttons
      document.querySelectorAll('.edit-category').forEach(btn => {
        btn.addEventListener('click', () => editCategory(btn.getAttribute('data-id')));
      });
      
      document.querySelectorAll('.delete-category').forEach(btn => {
        btn.addEventListener('click', () => deleteCategory(btn.getAttribute('data-id')));
      });
    } else {
      categoriesList.innerHTML = '<tr><td colspan="7" class="text-center">No categories found</td></tr>';
    }
    
    // Load categories for parent select
    loadCategoriesForSelect('category-parent');
  } catch (error) {
    console.error('Error loading categories:', error);
    showNotification('Error loading categories', 'error');
  }
}

// Edit category
async function editCategory(categoryId) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/categories/${categoryId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    const category = data.category;
    
    // Fill form with category data
    document.getElementById('category-id').value = category.id;
    document.getElementById('category-name').value = category.name;
    document.getElementById('category-description').value = category.description || '';
    document.getElementById('category-parent').value = category.parent_id || '';
    
    // Show category image
    const imagePreview = document.getElementById('category-image-preview');
    imagePreview.innerHTML = '';
    
    if (category.image_url) {
      const imgContainer = document.createElement('div');
      imgContainer.className = 'image-container';
      imgContainer.innerHTML = `
        <img src="${category.image_url}" alt="Category Image">
      `;
      imagePreview.appendChild(imgContainer);
    }
    
    // Update modal title
    document.getElementById('category-modal-title').textContent = 'Edit Category';
    
    // Show modal
    categoryModal.style.display = 'block';
  } catch (error) {
    console.error('Error loading category for edit:', error);
    showNotification('Error loading category', 'error');
  }
}

// Delete category
async function deleteCategory(categoryId) {
  if (confirm('Are you sure you want to delete this category?')) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        showNotification('Category deleted successfully', 'success');
        loadCategories();
      } else {
        const data = await response.json();
        showNotification(data.message || 'Error deleting category', 'error');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      showNotification('Error deleting category', 'error');
    }
  }
}

// Orders
async function loadOrders() {
  try {
    const token = localStorage.getItem('token');
    const statusFilter = document.getElementById('order-status-filter').value;
    const dateFilter = document.getElementById('order-date-filter').value;
    
    let url = `${API_URL}/orders?limit=10`;
    if (statusFilter) url += `&status=${statusFilter}`;
    if (dateFilter) url += `&date=${dateFilter}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    const ordersList = document.getElementById('orders-list');
    ordersList.innerHTML = '';
    
    if (data.orders && data.orders.length > 0) {
      data.orders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>#${order.id}</td>
          <td>${order.user_name}</td>
          <td>${formatDate(order.created_at)}</td>
          <td>$${order.total_amount.toFixed(2)}</td>
          <td><span class="status-badge ${order.status}">${order.status}</span></td>
          <td><span class="status-badge ${order.payment_status}">${order.payment_status}</span></td>
          <td>
            <button class="btn btn-primary btn-sm view-order" data-id="${order.id}"><i class="fas fa-eye"></i></button>
          </td>
        `;
        ordersList.appendChild(row);
      });
      
      // Add event listeners to view buttons
      document.querySelectorAll('.view-order').forEach(btn => {
        btn.addEventListener('click', () => viewOrder(btn.getAttribute('data-id')));
      });
      
      // Setup pagination
      setupPagination(data.pagination, 'orders-pagination', loadOrders);
    } else {
      ordersList.innerHTML = '<tr><td colspan="7" class="text-center">No orders found</td></tr>';
    }
  } catch (error) {
    console.error('Error loading orders:', error);
    showNotification('Error loading orders', 'error');
  }
}

// View order
async function viewOrder(orderId) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    const order = data.order;
    
    // Fill order details
    const orderDetails = document.getElementById('order-details');
    orderDetails.innerHTML = `
      <div class="order-info">
        <p><strong>Order ID:</strong> #${order.id}</p>
        <p><strong>Customer:</strong> ${order.user_name}</p>
        <p><strong>Date:</strong> ${formatDate(order.created_at)}</p>
        <p><strong>Status:</strong> <span class="status-badge ${order.status}">${order.status}</span></p>
        <p><strong>Payment Status:</strong> <span class="status-badge ${order.payment_status}">${order.payment_status}</span></p>
        <p><strong>Total Amount:</strong> $${order.total_amount.toFixed(2)}</p>
      </div>
      
      <div class="order-items">
        <h3>Order Items</h3>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${data.items.map(item => `
              <tr>
                <td>${item.title}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>${item.quantity}</td>
                <td>$${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <div class="order-addresses">
        <div class="address-container">
          <h3>Shipping Address</h3>
          <p>${data.shipping_address.address_line1}</p>
          ${data.shipping_address.address_line2 ? `<p>${data.shipping_address.address_line2}</p>` : ''}
          <p>${data.shipping_address.city}, ${data.shipping_address.state} ${data.shipping_address.postal_code}</p>
          <p>${data.shipping_address.country}</p>
        </div>
        
        <div class="address-container">
          <h3>Billing Address</h3>
          <p>${data.billing_address.address_line1}</p>
          ${data.billing_address.address_line2 ? `<p>${data.billing_address.address_line2}</p>` : ''}
          <p>${data.billing_address.city}, ${data.billing_address.state} ${data.billing_address.postal_code}</p>
          <p>${data.billing_address.country}</p>
        </div>
      </div>
    `;
    
    // Set current status in select
    document.getElementById('order-status').value = order.status;
    
    // Show modal
    orderModal.style.display = 'block';
    
    // Add event listener to update status button
    document.getElementById('update-order-btn').onclick = () => updateOrderStatus(orderId);
  } catch (error) {
    console.error('Error loading order details:', error);
    showNotification('Error loading order details', 'error');
  }
}

// Update order status
async function updateOrderStatus(orderId) {
  try {
    const token = localStorage.getItem('token');
    const status = document.getElementById('order-status').value;
    
    const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
    
    if (response.ok) {
      showNotification('Order status updated successfully', 'success');
      orderModal.style.display = 'none';
      loadOrders();
    } else {
      const data = await response.json();
      showNotification(data.message || 'Error updating order status', 'error');
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    showNotification('Error updating order status', 'error');
  }
}

// Users
async function loadUsers() {
  try {
    const token = localStorage.getItem('token');
    const roleFilter = document.getElementById('role-filter').value;
    
    let url = `${API_URL}/users?limit=10`;
    if (roleFilter) url += `&role=${roleFilter}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    const usersList = document.getElementById('users-list');
    usersList.innerHTML = '';
    
    if (data.users && data.users.length > 0) {
      data.users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${user.id}</td>
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td><span class="role-badge ${user.role}">${user.role}</span></td>
          <td>${formatDate(user.created_at)}</td>
          <td>
            <button class="btn btn-primary btn-sm edit-user" data-id="${user.id}"><i class="fas fa-edit"></i></button>
            <button class="btn btn-danger btn-sm delete-user" data-id="${user.id}"><i class="fas fa-trash"></i></button>
          </td>
        `;
        usersList.appendChild(row);
      });
      
      // Add event listeners to edit and delete buttons
      document.querySelectorAll('.edit-user').forEach(btn => {
        btn.addEventListener('click', () => editUser(btn.getAttribute('data-id')));
      });
      
      document.querySelectorAll('.delete-user').forEach(btn => {
        btn.addEventListener('click', () => deleteUser(btn.getAttribute('data-id')));
      });
      
      // Setup pagination
      setupPagination(data.pagination, 'users-pagination', loadUsers);
    } else {
      usersList.innerHTML = '<tr><td colspan="6" class="text-center">No users found</td></tr>';
    }
  } catch (error) {
    console.error('Error loading users:', error);
    showNotification('Error loading users', 'error');
  }
}

// Edit user
async function editUser(userId) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    const user = data.user;
    
    // Fill form with user data
    document.getElementById('user-id').value = user.id;
    document.getElementById('user-name').value = user.name;
    document.getElementById('user-email').value = user.email;
    document.getElementById('user-password').value = ''; // Don't show password
    document.getElementById('user-phone').value = user.phone || '';
    document.getElementById('user-role').value = user.role;
    
    // Update modal title
    document.getElementById('user-modal-title').textContent = 'Edit User';
    
    // Show modal
    userModal.style.display = 'block';
  } catch (error) {
    console.error('Error loading user for edit:', error);
    showNotification('Error loading user', 'error');
  }
}

// Delete user
async function deleteUser(userId) {
  if (confirm('Are you sure you want to delete this user?')) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        showNotification('User deleted successfully', 'success');
        loadUsers();
      } else {
        const data = await response.json();
        showNotification(data.message || 'Error deleting user', 'error');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showNotification('Error deleting user', 'error');
    }
  }
}

// Image Upload
async function uploadImage(file, type) {
  try {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${API_URL}/upload/${type}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.imageUrl;
    } else {
      const data = await response.json();
      showNotification(data.message || 'Error uploading image', 'error');
      return null;
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    showNotification('Error uploading image', 'error');
    return null;
  }
}

// Setup pagination
function setupPagination(pagination, containerId, loadFunction) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  
  if (pagination.totalPages <= 1) return;
  
  // Previous button
  const prevButton = document.createElement('button');
  prevButton.innerHTML = '&laquo;';
  prevButton.disabled = pagination.page === 1;
  prevButton.addEventListener('click', () => {
    if (pagination.page > 1) {
      document.querySelector(`#${containerId.replace('-pagination', '-page')}`).value = pagination.page - 1;
      loadFunction();
    }
  });
  container.appendChild(prevButton);
  
  // Page buttons
  const startPage = Math.max(1, pagination.page - 2);
  const endPage = Math.min(pagination.totalPages, pagination.page + 2);
  
  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement('button');
    pageButton.textContent = i;
    pageButton.className = i === pagination.page ? 'active' : '';
    pageButton.addEventListener('click', () => {
      document.querySelector(`#${containerId.replace('-pagination', '-page')}`).value = i;
      loadFunction();
    });
    container.appendChild(pageButton);
  }
  
  // Next button
  const nextButton = document.createElement('button');
  nextButton.innerHTML = '&raquo;';
  nextButton.disabled = pagination.page === pagination.totalPages;
  nextButton.addEventListener('click', () => {
    if (pagination.page < pagination.totalPages) {
      document.querySelector(`#${containerId.replace('-pagination', '-page')}`).value = pagination.page + 1;
      loadFunction();
    }
  });
  container.appendChild(nextButton);
}

// Helper Functions
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

function showNotification(message, type) {
  // Create notification element if it doesn't exist
  let notification = document.querySelector('.notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.className = 'notification';
    document.body.appendChild(notification);
  }
  
  // Set message and type
  notification.textContent = message;
  notification.className = `notification ${type}`;
  
  // Show notification
  notification.style.display = 'block';
  
  // Hide after 3 seconds
  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Check authentication
  if (!checkAuth()) return;
  
  // Setup navigation
  setupNavigation();
  
  // Load initial data (dashboard)
  loadDashboardData();
  
  // Logout button
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/sign-in.html';
  });
  
  // Close modal buttons
  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      productModal.style.display = 'none';
      categoryModal.style.display = 'none';
      userModal.style.display = 'none';
      orderModal.style.display = 'none';
    });
  });
  
  // Add product button
  addProductBtn.addEventListener('click', () => {
    // Reset form
    productForm.reset();
    document.getElementById('product-id').value = '';
    document.getElementById('image-preview').innerHTML = '';
    
    // Update modal title
    document.getElementById('product-modal-title').textContent = 'Add New Product';
    
    // Load categories for select
    loadCategoriesForSelect('product-category');
    
    // Show modal
    productModal.style.display = 'block';
  });
  
  // Add category button
  addCategoryBtn.addEventListener('click', () => {
    // Reset form
    categoryForm.reset();
    document.getElementById('category-id').value = '';
    document.getElementById('category-image-preview').innerHTML = '';
    
    // Update modal title
    document.getElementById('category-modal-title').textContent = 'Add New Category';
    
    // Load categories for parent select
    loadCategoriesForSelect('category-parent');
    
    // Show modal
    categoryModal.style.display = 'block';
  });
  
  // Add user button
  addUserBtn.addEventListener('click', () => {
    // Reset form
    userForm.reset();
    document.getElementById('user-id').value = '';
    
    // Update modal title
    document.getElementById('user-modal-title').textContent = 'Add New User';
    
    // Show modal
    userModal.style.display = 'block';
  });
  
  // Upload product images button
  uploadImagesBtn.addEventListener('click', async () => {
    const fileInput = document.getElementById('product-images');
    const files = fileInput.files;
    
    if (files.length === 0) {
      showNotification('Please select at least one image', 'error');
      return;
    }
    
    const imagePreview = document.getElementById('image-preview');
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const imageUrl = await uploadImage(file, 'product');
      
      if (imageUrl) {
        const imgContainer = document.createElement('div');
        imgContainer.className = 'image-container';
        imgContainer.innerHTML = `
          <img src="${imageUrl}" alt="Product Image">
          <input type="hidden" name="product_images[]" value="${imageUrl}">
        `;
        imagePreview.appendChild(imgContainer);
      }
    }
    
    // Clear file input
    fileInput.value = '';
  });
  
  // Upload category image button
  uploadCategoryImageBtn.addEventListener('click', async () => {
    const fileInput = document.getElementById('category-image');
    const file = fileInput.files[0];
    
    if (!file) {
      showNotification('Please select an image', 'error');
      return;
    }
    
    const imageUrl = await uploadImage(file, 'category');
    
    if (imageUrl) {
      const imagePreview = document.getElementById('category-image-preview');
      imagePreview.innerHTML = `
        <div class="image-container">
          <img src="${imageUrl}" alt="Category Image">
          <input type="hidden" name="category_image" value="${imageUrl}">
        </div>
      `;
      
      // Clear file input
      fileInput.value = '';
    }
  });
  
  // Product form submission
  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const productId = document.getElementById('product-id').value;
    const title = document.getElementById('product-title').value;
    const description = document.getElementById('product-description').value;
    const price = document.getElementById('product-price').value;
    const discountPrice = document.getElementById('product-discount').value;
    const quantity = document.getElementById('product-quantity').value;
    const categoryId = document.getElementById('product-category').value;
    const status = document.getElementById('product-status').value;
    
    // Get image URLs from hidden inputs
    const imageInputs = document.querySelectorAll('input[name="product_images[]"]');
    const images = Array.from(imageInputs).map(input => ({ url: input.value }));
    
    // Create product data object
    const productData = {
      title,
      description,
      price: parseFloat(price),
      discount_price: discountPrice ? parseFloat(discountPrice) : null,
      quantity: parseInt(quantity),
      category_id: parseInt(categoryId),
      status,
      images
    };
    
    try {
      const token = localStorage.getItem('token');
      const method = productId ? 'PUT' : 'POST';
      const url = productId ? `${API_URL}/products/${productId}` : `${API_URL}/products`;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });
      
      if (response.ok) {
        showNotification(`Product ${productId ? 'updated' : 'created'} successfully`, 'success');
        productModal.style.display = 'none';
        loadProducts();
      } else {
        const data = await response.json();
        showNotification(data.message || `Error ${productId ? 'updating' : 'creating'} product`, 'error');
      }
    } catch (error) {
      console.error(`Error ${productId ? 'updating' : 'creating'} product:`, error);
      showNotification(`Error ${productId ? 'updating' : 'creating'} product`, 'error');
    }
  });
  
  // Category form submission
  categoryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const categoryId = document.getElementById('category-id').value;
    const name = document.getElementById('category-name').value;
    const description = document.getElementById('category-description').value;
    const parentId = document.getElementById('category-parent').value;
    
    // Get image URL from hidden input
    const imageInput = document.querySelector('input[name="category_image"]');
    const imageUrl = imageInput ? imageInput.value : null;
    
    // Create category data object
    const categoryData = {
      name,
      description,
      parent_id: parentId ? parseInt(parentId) : null,
      image_url: imageUrl
    };
    
    try {
      const token = localStorage.getItem('token');
      const method = categoryId ? 'PUT' : 'POST';
      const url = categoryId ? `${API_URL}/categories/${categoryId}` : `${API_URL}/categories`;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryData)
      });
      
      if (response.ok) {
        showNotification(`Category ${categoryId ? 'updated' : 'created'} successfully`, 'success');
        categoryModal.style.display = 'none';
        loadCategories();
      } else {
        const data = await response.json();
        showNotification(data.message || `Error ${categoryId ? 'updating' : 'creating'} category`, 'error');
      }
    } catch (error) {
      console.error(`Error ${categoryId ? 'updating' : 'creating'} category:`, error);
      showNotification(`Error ${categoryId ? 'updating' : 'creating'} category`, 'error');
    }
  });
  
  // User form submission
  userForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userId = document.getElementById('user-id').value;
    const name = document.getElementById('user-name').value;
    const email = document.getElementById('user-email').value;
    const password = document.getElementById('user-password').value;
    const phone = document.getElementById('user-phone').value;
    const role = document.getElementById('user-role').value;
    
    // Create user data object
    const userData = {
      name,
      email,
      phone,
      role
    };
    
    // Add password only if provided (for updates)
    if (password) {
      userData.password = password;
    }
    
    try {
      const token = localStorage.getItem('token');
      const method = userId ? 'PUT' : 'POST';
      const url = userId ? `${API_URL}/users/${userId}` : `${API_URL}/users`;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      if (response.ok) {
        showNotification(`User ${userId ? 'updated' : 'created'} successfully`, 'success');
        userModal.style.display = 'none';
        loadUsers();
      } else {
        const data = await response.json();
        showNotification(data.message || `Error ${userId ? 'updating' : 'creating'} user`, 'error');
      }
    } catch (error) {
      console.error(`Error ${userId ? 'updating' : 'creating'} user:`, error);
      showNotification(`Error ${userId ? 'updating' : 'creating'} user`, 'error');
    }
  });
  
  // Settings form submission
  generalSettingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const siteName = document.getElementById('site-name').value;
    const siteDescription = document.getElementById('site-description').value;
    const contactEmail = document.getElementById('contact-email').value;
    
    // Create settings data object
    const settingsData = {
      site_name: siteName,
      site_description: siteDescription,
      contact_email: contactEmail
    };
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settingsData)
      });
      
      if (response.ok) {
        showNotification('Settings updated successfully', 'success');
      } else {
        const data = await response.json();
        showNotification(data.message || 'Error updating settings', 'error');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      showNotification('Error updating settings', 'error');
    }
  });
  
  // Close modals when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === productModal) productModal.style.display = 'none';
    if (e.target === categoryModal) categoryModal.style.display = 'none';
    if (e.target === userModal) userModal.style.display = 'none';
    if (e.target === orderModal) orderModal.style.display = 'none';
  });
  
  // Filter change events
  document.getElementById('category-filter')?.addEventListener('change', loadProducts);
  document.getElementById('status-filter')?.addEventListener('change', loadProducts);
  document.getElementById('order-status-filter')?.addEventListener('change', loadOrders);
  document.getElementById('order-date-filter')?.addEventListener('change', loadOrders);
  document.getElementById('role-filter')?.addEventListener('change', loadUsers);
  
  // Cancel buttons
  document.getElementById('cancel-product-btn')?.addEventListener('click', () => {
    productModal.style.display = 'none';
  });
  
  document.getElementById('cancel-category-btn')?.addEventListener('click', () => {
    categoryModal.style.display = 'none';
  });
  
  document.getElementById('cancel-user-btn')?.addEventListener('click', () => {
    userModal.style.display = 'none';
  });
  
  document.getElementById('close-order-btn')?.addEventListener('click', () => {
    orderModal.style.display = 'none';
  });
});