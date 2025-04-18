/**
 * Wishlist Management Functionality
 */

// Initialize wishlist module
const Wishlist = (function() {
  // Private variables
  let wishlistItems = [];
  let wishlistCount = 0;
  const wishlistCountElement = document.querySelector('.wishlist-count');
  const wishlistIcon = document.getElementById('wishlist-icon');
  
  // Check if user is logged in
  const isLoggedIn = () => {
    return localStorage.getItem('token') !== null;
  };
  
  // Get auth token
  const getToken = () => {
    return localStorage.getItem('token');
  };
  
  // Update wishlist count in UI
  const updateWishlistCount = (count) => {
    wishlistCount = count;
    if (wishlistCountElement) {
      wishlistCountElement.textContent = count;
    }
  };
  
  // Fetch wishlist items from API
  const fetchWishlistItems = async () => {
    if (!isLoggedIn()) {
      console.log('User not logged in');
      return;
    }
    
    try {
      const response = await fetch('/api/wishlist', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch wishlist items');
      }
      
      const data = await response.json();
      wishlistItems = data.wishlistItems || [];
      updateWishlistCount(wishlistItems.length);
      return data;
    } catch (error) {
      console.error('Error fetching wishlist items:', error);
      return { wishlistItems: [], totalItems: 0 };
    }
  };
  
  // Add item to wishlist
  const addToWishlist = async (productId) => {
    if (!isLoggedIn()) {
      alert('Please log in to add items to your wishlist');
      window.location.href = '/sign-in.html';
      return;
    }
    
    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ productId })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add item to wishlist');
      }
      
      const data = await response.json();
      await fetchWishlistItems(); // Refresh wishlist after adding item
      
      // Show success message
      showNotification('Product added to wishlist successfully');
      return data;
    } catch (error) {
      console.error('Error adding item to wishlist:', error);
      showNotification(error.message, 'error');
      return null;
    }
  };
  
  // Remove item from wishlist
  const removeFromWishlist = async (productId) => {
    if (!isLoggedIn()) {
      return;
    }
    
    try {
      const response = await fetch(`/api/wishlist/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove item from wishlist');
      }
      
      await fetchWishlistItems(); // Refresh wishlist after removing
      showNotification('Product removed from wishlist');
      return true;
    } catch (error) {
      console.error('Error removing item from wishlist:', error);
      showNotification(error.message, 'error');
      return false;
    }
  };
  
  // Move item from wishlist to cart
  const moveToCart = async (productId, quantity = 1) => {
    if (!isLoggedIn()) {
      return;
    }
    
    try {
      const response = await fetch('/api/wishlist/move-to-cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ productId, quantity })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to move item to cart');
      }
      
      const data = await response.json();
      await fetchWishlistItems(); // Refresh wishlist after moving
      
      // Update cart count if Cart module is available
      if (typeof Cart !== 'undefined' && Cart.fetchCartItems) {
        Cart.fetchCartItems();
      }
      
      showNotification('Product moved to cart successfully');
      return data;
    } catch (error) {
      console.error('Error moving item to cart:', error);
      showNotification(error.message, 'error');
      return null;
    }
  };
  
  // Clear wishlist (remove all items)
  const clearWishlist = async () => {
    if (!isLoggedIn()) {
      return;
    }
    
    try {
      const response = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to clear wishlist');
      }
      
      updateWishlistCount(0);
      wishlistItems = [];
      showNotification('Wishlist cleared successfully');
      return true;
    } catch (error) {
      console.error('Error clearing wishlist:', error);
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
  
  // Create and show wishlist modal
  const showWishlistModal = async () => {
    // Fetch latest wishlist items
    const wishlistData = await fetchWishlistItems();
    if (!wishlistData || !wishlistData.wishlistItems || wishlistData.wishlistItems.length === 0) {
      showNotification('Your wishlist is empty', 'error');
      return;
    }
    
    // Create modal container if it doesn't exist
    let modalContainer = document.getElementById('wishlist-modal-container');
    if (!modalContainer) {
      modalContainer = document.createElement('div');
      modalContainer.id = 'wishlist-modal-container';
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
    modalContent.className = 'wishlist-modal';
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
    modalTitle.textContent = 'Your Wishlist';
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
    
    // Create wishlist items list
    const wishlistItemsList = document.createElement('div');
    wishlistItemsList.className = 'wishlist-items-list';
    wishlistItemsList.style.display = 'grid';
    wishlistItemsList.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
    wishlistItemsList.style.gap = '20px';
    
    wishlistData.wishlistItems.forEach(item => {
      const wishlistItem = document.createElement('div');
      wishlistItem.className = 'wishlist-item';
      wishlistItem.style.border = '1px solid #eee';
      wishlistItem.style.borderRadius = '8px';
      wishlistItem.style.overflow = 'hidden';
      wishlistItem.style.position = 'relative';
      
      // Item image
      const itemImage = document.createElement('img');
      itemImage.src = item.image_url || 'placeholder.jpg';
      itemImage.alt = item.title;
      itemImage.style.width = '100%';
      itemImage.style.height = '180px';
      itemImage.style.objectFit = 'cover';
      
      // Item details
      const itemDetails = document.createElement('div');
      itemDetails.style.padding = '15px';
      
      const itemTitle = document.createElement('h3');
      itemTitle.textContent = item.title;
      itemTitle.style.margin = '0 0 10px 0';
      itemTitle.style.fontSize = '16px';
      
      const itemPrice = document.createElement('p');
      const price = item.discount_price || item.price;
      itemPrice.textContent = `$${price}`;
      itemPrice.style.margin = '0 0 15px 0';
      itemPrice.style.fontWeight = 'bold';
      itemPrice.style.color = '#256AF5';
      
      // Stock status
      const stockStatus = document.createElement('p');
      stockStatus.textContent = item.stock > 0 ? `In Stock (${item.stock})` : 'Out of Stock';
      stockStatus.style.margin = '0 0 15px 0';
      stockStatus.style.fontSize = '14px';
      stockStatus.style.color = item.stock > 0 ? '#4CAF50' : '#f44336';
      
      // Action buttons
      const actionButtons = document.createElement('div');
      actionButtons.style.display = 'flex';
      actionButtons.style.gap = '10px';
      
      const moveToCartButton = document.createElement('button');
      moveToCartButton.textContent = 'Add to Cart';
      moveToCartButton.style.flex = '1';
      moveToCartButton.style.padding = '8px';
      moveToCartButton.style.backgroundColor = '#256AF5';
      moveToCartButton.style.color = 'white';
      moveToCartButton.style.border = 'none';
      moveToCartButton.style.borderRadius = '4px';
      moveToCartButton.style.cursor = 'pointer';
      moveToCartButton.disabled = item.stock <= 0;
      moveToCartButton.style.opacity = item.stock > 0 ? '1' : '0.5';
      moveToCartButton.onclick = () => {
        moveToCart(item.product_id);
      };
      
      const removeButton = document.createElement('button');
      removeButton.textContent = 'Remove';
      removeButton.style.padding = '8px';
      removeButton.style.backgroundColor = '#ff6b6b';
      removeButton.style.color = 'white';
      removeButton.style.border = 'none';
      removeButton.style.borderRadius = '4px';
      removeButton.style.cursor = 'pointer';
      removeButton.onclick = () => {
        removeFromWishlist(item.product_id);
      };
      
      actionButtons.appendChild(moveToCartButton);
      actionButtons.appendChild(removeButton);
      
      itemDetails.appendChild(itemTitle);
      itemDetails.appendChild(itemPrice);
      itemDetails.appendChild(stockStatus);
      itemDetails.appendChild(actionButtons);
      
      wishlistItem.appendChild(itemImage);
      wishlistItem.appendChild(itemDetails);
      
      wishlistItemsList.appendChild(wishlistItem);
    });
    
    modalContent.appendChild(wishlistItemsList);
    
    // Create action buttons
    const actionButtons = document.createElement('div');
    actionButtons.style.display = 'flex';
    actionButtons.style.justifyContent = 'space-between';
    actionButtons.style.marginTop = '20px';
    
    const clearWishlistButton = document.createElement('button');
    clearWishlistButton.textContent = 'Clear Wishlist';
    clearWishlistButton.style.backgroundColor = '#f44336';
    clearWishlistButton.style.color = 'white';
    clearWishlistButton.style.border = 'none';
    clearWishlistButton.style.padding = '10px 15px';
    clearWishlistButton.style.borderRadius = '4px';
    clearWishlistButton.style.cursor = 'pointer';
    clearWishlistButton.onclick = () => {
      if (confirm('Are you sure you want to clear your wishlist?')) {
        clearWishlist();
        modalContainer.style.display = 'none';
      }
    };
    
    const moveAllToCartButton = document.createElement('button');
    moveAllToCartButton.textContent = 'Move All to Cart';
    moveAllToCartButton.style.backgroundColor = '#4CAF50';
    moveAllToCartButton.style.color = 'white';
    moveAllToCartButton.style.border = 'none';
    moveAllToCartButton.style.padding = '10px 15px';
    moveAllToCartButton.style.borderRadius = '4px';
    moveAllToCartButton.style.cursor = 'pointer';
    moveAllToCartButton.onclick = async () => {
      if (confirm('Move all available items to your cart?')) {
        let successCount = 0;
        for (const item of wishlistData.wishlistItems) {
          if (item.stock > 0) {
            const result = await moveToCart(item.product_id);
            if (result) successCount++;
          }
        }
        showNotification(`${successCount} items moved to cart successfully`);
        if (successCount > 0) {
          modalContainer.style.display = 'none';
        }
      }
    };
    
    actionButtons.appendChild(clearWishlistButton);
    actionButtons.appendChild(moveAllToCartButton);
    
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
  
  // Initialize wishlist
  const init = () => {
    // Add click event to wishlist icon
    if (wishlistIcon) {
      wishlistIcon.addEventListener('click', (e) => {
        e.preventDefault();
        if (isLoggedIn()) {
          showWishlistModal();
        } else {
          alert('Please log in to view your wishlist');
          window.location.href = '/sign-in.html';
        }
      });
    }
    
    // Fetch wishlist items on page load if user is logged in
    if (isLoggedIn()) {
      fetchWishlistItems();
    }
    
    // Add event listeners to add-to-wishlist buttons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('add-to-wishlist') || e.target.closest('.add-to-wishlist')) {
        e.preventDefault();
        const button = e.target.classList.contains('add-to-wishlist') ? e.target : e.target.closest('.add-to-wishlist');
        const productId = button.dataset.productId;
        
        if (productId) {
          addToWishlist(productId);
        }
      }
    });
  };
  
  // Public API
  return {
    init,
    fetchWishlistItems,
    addToWishlist,
    removeFromWishlist,
    moveToCart,
    clearWishlist,
    showWishlistModal
  };
})();

// Initialize wishlist when DOM is loaded
document.addEventListener('DOMContentLoaded', Wishlist.init);