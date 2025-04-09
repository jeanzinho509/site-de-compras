// Add this JavaScript
document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('signinModal');
  const signInBtn = document.querySelector('a:contains("Sign In")'); // Update selector based on your actual button
  const span = document.getElementsByClassName('close')[0];

  // Show modal when clicking Sign In
  signInBtn.onclick = function(e) {
    e.preventDefault();
    modal.style.display = 'block';
  }

  // Close modal when clicking ×
  span.onclick = function() {
    modal.style.display = 'none';
  }

  // Close when clicking outside modal
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  }
});