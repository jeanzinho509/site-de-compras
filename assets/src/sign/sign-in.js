// script.js
document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const loginCard = document.getElementById('login-card');
  const registerCard = document.getElementById('register-card');
  const forgotPasswordCard = document.getElementById('forgot-password-card');
  const createAccountBtn = document.getElementById('create-account-btn');
  const signInLink = document.getElementById('sign-in-link');
  const forgotPasswordLink = document.getElementById('forgot-password-link');
  const backToLoginLink = document.getElementById('back-to-login');
  
  // Forms
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const forgotPasswordForm = document.getElementById('forgot-password-form');
  
  // Toggle between login and registration
  createAccountBtn.addEventListener('click', () => {
      loginCard.style.display = 'none';
      registerCard.style.display = 'block';
  });
  
  signInLink.addEventListener('click', (e) => {
      e.preventDefault();
      registerCard.style.display = 'none';
      loginCard.style.display = 'block';
  });
  
  // Toggle forgot password
  forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      loginCard.style.display = 'none';
      forgotPasswordCard.style.display = 'block';
  });
  
  backToLoginLink.addEventListener('click', (e) => {
      e.preventDefault();
      forgotPasswordCard.style.display = 'none';
      loginCard.style.display = 'block';
  });
  
  // Form validation
  loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const emailError = document.getElementById('email-error');
      const passwordError = document.getElementById('password-error');
      
      let valid = true;
      
      // Reset errors
      emailError.style.display = 'none';
      passwordError.style.display = 'none';
      
      // Validate email
      if (!validateEmail(email)) {
          emailError.textContent = 'Please enter a valid email address';
          emailError.style.display = 'block';
          valid = false;
      }
      
      // Validate password
      if (password.length < 6) {
          passwordError.textContent = 'Password must be at least 6 characters';
          passwordError.style.display = 'block';
          valid = false;
      }
      
      if (valid) {
          // Here you would normally send the data to your server
          alert('Login successful! This would normally redirect to your dashboard.');
          // Mock implementation - in real world, you'd make an API call
          console.log('Login form submitted with:', { email, password });
      }
  });
  
  registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('register-email').value;
      const password = document.getElementById('register-password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      
      const nameError = document.getElementById('name-error');
      const emailError = document.getElementById('register-email-error');
      const passwordError = document.getElementById('register-password-error');
      const confirmPasswordError = document.getElementById('confirm-password-error');
      
      let valid = true;
      
      // Reset errors
      nameError.style.display = 'none';
      emailError.style.display = 'none';
      passwordError.style.display = 'none';
      confirmPasswordError.style.display = 'none';
      
      // Validate name
      if (name.trim().length < 2) {
          nameError.textContent = 'Please enter your full name';
          nameError.style.display = 'block';
          valid = false;
      }
      
      // Validate email
      if (!validateEmail(email)) {
          emailError.textContent = 'Please enter a valid email address';
          emailError.style.display = 'block';
          valid = false;
      }
      
      // Validate password
      if (password.length < 6) {
          passwordError.textContent = 'Password must be at least 6 characters';
          passwordError.style.display = 'block';
          valid = false;
      }
      
      // Validate confirmation password
      if (password !== confirmPassword) {
          confirmPasswordError.textContent = 'Passwords do not match';
          confirmPasswordError.style.display = 'block';
          valid = false;
      }
      
      if (valid) {
          // Here you would normally send the data to your server
          alert('Account created successfully! This would normally redirect to your dashboard.');
          // Mock implementation - in real world, you'd make an API call
          console.log('Register form submitted with:', { name, email, password });
      }
  });
  
  forgotPasswordForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('reset-email').value;
      const emailError = document.getElementById('reset-email-error');
      
      let valid = true;
      
      // Reset errors
      emailError.style.display = 'none';
      
      // Validate email
      if (!validateEmail(email)) {
          emailError.textContent = 'Please enter a valid email address';
          emailError.style.display = 'block';
          valid = false;
      }
      
      if (valid) {
          // Here you would normally send the data to your server
          alert('Password reset link sent! Check your email.');
          // Mock implementation - in real world, you'd make an API call
          console.log('Reset password request for:', email);
          
          // Show login form again
          forgotPasswordCard.style.display = 'none';
          loginCard.style.display = 'block';
      }
  });
  
  // Helper functions
  function validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
  }
});