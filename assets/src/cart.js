/**
 * Cart Management Functionality
 */

// Initialize cart module
const Cart = (function() {
  // Private variables
  let cartItems = [];
  let cartCount = 0;
  const cartCountElement = document.querySelector('.cart-count');
  const cartIcon = document.getElementById('cart-icon');
  
  // Check if user is logged in
  const isLoggedIn = () => {
    return localStorage.getItem('token') !== null;
  };
  
  // Get auth token
  const getToken = () => {
    return localStorage.getItem('token');
  };
  
  // Update cart count in UI
  const updateCartCount = (count) => {
    cartCount = count;
    if (cartCountElement) {
      cartCountElement.textContent = count;
    }
  };
  
  // Fetch cart items from API
  const fetchCartItems = async () => {
    if (!isLoggedIn()) {
      console.log('User not logged in');
      return;
    }
    
    try {
      const response = await fetch('/api/cart', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch cart items');
      }
      
      const data = await response.json();
      cartItems = data.cartItems || [];
      updateCartCount(cartItems.length);
      return data;
    } catch (error) {
      console.error('Error fetching cart items:', error);
      return { cartItems: [], cartSummary: { totalItems: 0 } };
    }
  };
  
  // Add item to cart
  const addToCart = async (productId, quantity = 1) => {
    if (!isLoggedIn()) {
      alert('Please log in to add items to your cart');
      window.location.href = '/sign-in.html';
      return;
    }
    
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ productId, quantity })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add item to cart');
      }
      
      const data = await response.json();
      await fetchCartItems(); // Refresh cart after adding item
      
      // Show success message
      showNotification('Product added to cart successfully');
      return data;
    } catch (error) {
      console.error('Error adding item to cart:', error);
      showNotification(error.message, 'error');
      return null;
    }
  };
  
  // Update cart item quantity
  const updateCartItem = async (productId, quantity) => {
    if (!isLoggedIn()) {
      return;
    }
    
    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ productId, quantity })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update cart item');
      }
      
      const data = await response.json();
      await fetchCartItems(); // Refresh cart after updating
      return data;
    } catch (error) {
      console.error('Error updating cart item:', error);
      showNotification(error.message, 'error');
      return null;
    }
  };
  
  // Remove item from cart
  const removeFromCart = async (productId) => {
    if (!isLoggedIn()) {
      return;
    }
    
    try {
      const response = await fetch(`/api/cart/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove item from cart');
      }
      
      await fetchCartItems(); // Refresh cart after removing
      showNotification('Product removed from cart');
      return true;
    } catch (error) {
      console.error('Error removing item from cart:', error);
      showNotification(error.message, 'error');
      return false;
    }
  };
  
  // Clear cart (remove all items)
  const clearCart = async () => {
    if (!isLoggedIn()) {
      return;
    }
    
    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to clear cart');
      }
      
      updateCartCount(0);
      cartItems = [];
      showNotification('Cart cleared successfully');
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      showNotification(error.message, 'error');
      return false;
    }
  };
  
  // Show notification
  const showNotification = (message, type = 'success') => {
    // Check if notification container exists, if not create it
    let notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
      notificationContainer = document.createElement('div');
      notificationContainer.id = 'notification-container';
      notificationContainer.style.position = 'fixed';
      notificationContainer.style.top = '20px';
      notificationContainer.style.right = '20px';
      notificationContainer.style.zIndex = '1000';
      document.body.appendChild(notificationContainer);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.backgroundColor = type === 'success' ? '#4CAF50' : '#f44336';
    notification.style.color = 'white';
    notification.style.padding = '15px';
    notification.style.marginBottom = '10px';
    notification.style.borderRadius = '4px';
    notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    notification.textContent = message;
    
    // Add notification to container
    notificationContainer.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.5s';
      setTimeout(() => {
        notificationContainer.removeChild(notification);
      }, 500);
    }, 3000);
  };
  
  // Create and show cart modal
  const showCartModal = async () => {
    // Fetch latest cart items
    const cartData = await fetchCartItems();
    if (!cartData || !cartData.cartItems || cartData.cartItems.length === 0) {
      showNotification('Your cart is empty', 'error');
      return;
    }
    
    // Create modal container if it doesn't exist
    let modalContainer = document.getElementById('cart-modal-container');
    if (!modalContainer) {
      modalContainer = document.createElement('div');
      modalContainer.id = 'cart-modal-container';
      modalContainer.style.position = 'fixed';
      modalContainer.style.top = '0';
      modalContainer.style.left = '0';
      modalContainer.style.width = '100%';
      modalContainer.style.height = '100%';
      modalContainer.style.backgroundColor = 'rgba(0,0,0,0.5)';
      modalContainer.style.display = 'flex';
      modalContainer.style.justifyContent = 'center';
      modalContainer.style.alignItems = 'center';
      modalContainer.style.zIndex = '1001';
      document.body.appendChild(modalContainer);
    } else {
      modalContainer.innerHTML = '';
      modalContainer.style.display = 'flex';
    }
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'cart-modal';
    modalContent.style.backgroundColor = 'white';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '8px';
    modalContent.style.maxWidth = '800px';
    modalContent.style.width = '90%';
    modalContent.style.maxHeight = '80vh';
    modalContent.style.overflowY = 'auto';
    
    // Create modal header
    const modalHeader = document.createElement('div');
    modalHeader.style.display = 'flex';
    modalHeader.style.justifyContent = 'space-between';
    modalHeader.style.alignItems = 'center';
    modalHeader.style.marginBottom = '20px';
    
    const modalTitle = document.createElement('h2');
    modalTitle.textContent = 'Your Cart';
    modalTitle.style.margin = '0';
    
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '24px';
    closeButton.style.cursor = 'pointer';
    closeButton.onclick = () => {
      modalContainer.style.display = 'none';
    };
    
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeButton);
    modalContent.appendChild(modalHeader);
    
    // Create cart items list
    const cartItemsList = document.createElement('div');
    cartItemsList.className = 'cart-items-list';
    
    cartData.cartItems.forEach(item => {
      const cartItem = document.createElement('div');
      cartItem.className = 'cart-item';
      cartItem.style.display = 'flex';
      cartItem.style.marginBottom = '15px';
      cartItem.style.padding = '10px';
      cartItem.style.borderBottom = '1px solid #eee';
      
      // Item image
      const itemImage = document.createElement('img');
      itemImage.src = item.image_url || 'placeholder.jpg';
      itemImage.alt = item.title;
      itemImage.style.width = '80px';
      itemImage.style.height = '80px';
      itemImage.style.objectFit = 'cover';
      itemImage.style.marginRight = '15px';
      
      // Item details
      const itemDetails = document.createElement('div');
      itemDetails.style.flex = '1';
      
      const itemTitle = document.createElement('h3');
      itemTitle.textContent = item.title;
      itemTitle.style.margin = '0 0 5px 0';
      
      const itemPrice = document.createElement('p');
      itemPrice.textContent = `Price: $${item.discount_price || item.price}`;
      itemPrice.style.margin = '0 0 5px 0';
      
      const quantityContainer = document.createElement('div');
      quantityContainer.style.display = 'flex';
      quantityContainer.style.alignItems = 'center';
      
      const decreaseBtn = document.createElement('button');
      decreaseBtn.textContent = '-';
      decreaseBtn.style.width = '30px';
      decreaseBtn.style.height = '30px';
      decreaseBtn.style.border = '1px solid #ddd';
      decreaseBtn.style.background = 'none';
      decreaseBtn.style.cursor = 'pointer';
      decreaseBtn.onclick = () => {
        const newQuantity = Math.max(1, item.quantity - 1);
        updateCartItem(item.product_id, newQuantity);
      };
      
      const quantityInput = document.createElement('input');
      quantityInput.type = 'number';
      quantityInput.value = item.quantity;
      quantityInput.min = '1';
      quantityInput.style.width = '40px';
      quantityInput.style.height = '30px';
      quantityInput.style.textAlign = 'center';
      quantityInput.style.margin = '0 5px';
      quantityInput.style.border = '1px solid #ddd';
      quantityInput.onchange = (e) => {
        const newQuantity = parseInt(e.target.value) || 1;
        updateCartItem(item.product_id, newQuantity);
      };
      
      const increaseBtn = document.createElement('button');
      increaseBtn.textContent = '+';
      increaseBtn.style.width = '30px';
      increaseBtn.style.height = '30px';
      increaseBtn.style.border = '1px solid #ddd';
      increaseBtn.style.background = 'none';
      increaseBtn.style.cursor = 'pointer';
      increaseBtn.onclick = () => {
        updateCartItem(item.product_id, item.quantity + 1);
      };
      
      quantityContainer.appendChild(decreaseBtn);
      quantityContainer.appendChild(quantityInput);
      quantityContainer.appendChild(increaseBtn);
      
      itemDetails.appendChild(itemTitle);
      itemDetails.appendChild(itemPrice);
      itemDetails.appendChild(quantityContainer);
      
      // Remove button
      const removeButton = document.createElement('button');
      removeButton.textContent = 'Remove';
      removeButton.style.background = '#ff6b6b';
      removeButton.style.color = 'white';
      removeButton.style.border = 'none';
      removeButton.style.padding = '5px 10px';
      removeButton.style.borderRadius = '4px';
      removeButton.style.cursor = 'pointer';
      removeButton.style.alignSelf = 'flex-start';
      removeButton.onclick = () => {
        removeFromCart(item.product_id);
      };
      
      cartItem.appendChild(itemImage);
      cartItem.appendChild(itemDetails);
      cartItem.appendChild(removeButton);
      
      cartItemsList.appendChild(cartItem);
    });
    
    modalContent.appendChild(cartItemsList);
    
    // Create cart summary
    const cartSummary = document.createElement('div');
    cartSummary.className = 'cart-summary';
    cartSummary.style.marginTop = '20px';
    cartSummary.style.padding = '15px';
    cartSummary.style.backgroundColor = '#f9f9f9';
    cartSummary.style.borderRadius = '4px';
    
    const subtotal = document.createElement('p');
    subtotal.textContent = `Subtotal: $${cartData.cartSummary.subtotal.toFixed(2)}`;
    subtotal.style.margin = '5px 0';
    
    const discount = document.createElement('p');
    discount.textContent = `Discount: $${cartData.cartSummary.discountTotal.toFixed(2)}`;
    discount.style.margin = '5px 0';
    
    const total = document.createElement('p');
    total.textContent = `Total: $${cartData.cartSummary.finalTotal.toFixed(2)}`;
    total.style.fontWeight = 'bold';
    total.style.margin = '10px 0 5px 0';
    
    cartSummary.appendChild(subtotal);
    cartSummary.appendChild(discount);
    cartSummary.appendChild(total);
    
    modalContent.appendChild(cartSummary);
    
    // Create action buttons
    const actionButtons = document.createElement('div');
    actionButtons.style.display = 'flex';
    actionButtons.style.justifyContent = 'space-between';
    actionButtons.style.marginTop = '20px';
    
    const clearCartButton = document.createElement('button');
    clearCartButton.textContent = 'Clear Cart';
    clearCartButton.style.backgroundColor = '#f44336';
    clearCartButton.style.color = 'white';
    clearCartButton.style.border = 'none';
    clearCartButton.style.padding = '10px 15px';
    clearCartButton.style.borderRadius = '4px';
    clearCartButton.style.cursor = 'pointer';
    clearCartButton.onclick = () => {
      if (confirm('Are you sure you want to clear your cart?')) {
        clearCart();
        modalContainer.style.display = 'none';
      }
    };
    
    const checkoutButton = document.createElement('button');
    checkoutButton.textContent = 'Checkout';
    checkoutButton.style.backgroundColor = '#4CAF50';
    checkoutButton.style.color = 'white';
    checkoutButton.style.border = 'none';
    checkoutButton.style.padding = '10px 15px';
    checkoutButton.style.borderRadius = '4px';
    checkoutButton.style.cursor = 'pointer';
    checkoutButton.onclick = () => {
      alert('Checkout functionality coming soon!');
    };
    
    actionButtons.appendChild(clearCartButton);
    actionButtons.appendChild(checkoutButton);
    
    modalContent.appendChild(actionButtons);
    
    // Add modal content to container
    modalContainer.appendChild(modalContent);
    
    // Close modal when clicking outside
    modalContainer.onclick = (e) => {
      if (e.target === modalContainer) {
        modalContainer.style.display = 'none';
      }
    };
  };
  
  // Initialize cart
  const init = () => {
    // Add click event to cart icon
    if (cartIcon) {
      cartIcon.addEventListener('click', (e) => {
        e.preventDefault();
        if (isLoggedIn()) {
          showCartModal();
        } else {
          alert('Please log in to view your cart');
          window.location.href = '/sign-in.html';
        }
      });
    }
    
    // Fetch cart items on page load if user is logged in
    if (isLoggedIn()) {
      fetchCartItems();
    }
    
    // Add event listeners to add-to-cart buttons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('add-to-cart') || e.target.closest('.add-to-cart')) {
        e.preventDefault();
        const button = e.target.classList.contains('add-to-cart') ? e.target : e.target.closest('.add-to-cart');
        const productId = button.dataset.productId;
        const quantity = parseInt(button.dataset.quantity) || 1;
        
        if (productId) {
          addToCart(productId, quantity);
        }
      }
    });
  };
  
  // Public API
  return {
    init,
    fetchCartItems,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    showCartModal
  };
})();

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', Cart.init);