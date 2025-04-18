// reset-password.js
document.addEventListener('DOMContentLoaded', function() {
  // API URL
  const API_URL = '/api';
  
  // DOM elements
  const resetPasswordForm = document.getElementById('reset-password-form');
  const tokenErrorDiv = document.getElementById('token-error');
  const successMessageDiv = document.getElementById('success-message');
  
  // Get token from URL
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  // Check if token exists
  if (!token) {
    // Show token error
    tokenErrorDiv.style.display = 'block';
    resetPasswordForm.style.display = 'none';
    return;
  }
  
  // Form submission
  resetPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const newPassword = document.getElementById('new-password').value;
    const confirmNewPassword = document.getElementById('confirm-new-password').value;
    
    const newPasswordError = document.getElementById('new-password-error');
    const confirmNewPasswordError = document.getElementById('confirm-new-password-error');
    
    let valid = true;
    
    // Reset errors
    newPasswordError.style.display = 'none';
    confirmNewPasswordError.style.display = 'none';
    
    // Validate password
    if (newPassword.length < 6) {
      newPasswordError.textContent = 'Password must be at least 6 characters';
      newPasswordError.style.display = 'block';
      valid = false;
    }
    
    // Validate confirmation password
    if (newPassword !== confirmNewPassword) {
      confirmNewPasswordError.textContent = 'Passwords do not match';
      confirmNewPasswordError.style.display = 'block';
      valid = false;
    }
    
    if (valid) {
      try {
        const response = await fetch(`${API_URL}/auth/reset-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ token, newPassword })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          // Show success message
          resetPasswordForm.style.display = 'none';
          successMessageDiv.style.display = 'block';
        } else {
          // Show error message
          tokenErrorDiv.textContent = data.message || 'Failed to reset password. Please try again.';
          tokenErrorDiv.style.display = 'block';
        }
      } catch (error) {
        console.error('Reset password error:', error);
        tokenErrorDiv.textContent = 'An error occurred. Please try again later.';
        tokenErrorDiv.style.display = 'block';
      }
    }
  });
});