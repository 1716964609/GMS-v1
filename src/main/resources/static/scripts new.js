// Get elements for login and register buttons, forms, and overlay
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const overlay = document.getElementById('overlay');
const closeLoginForm = document.getElementById('closeLoginForm');
const closeRegisterForm = document.getElementById('closeRegisterForm');

// Function to show the login form
loginBtn.addEventListener('click', () => {
    loginForm.classList.remove('hidden');   // Display the login form
    overlay.style.display = 'block';        // Show the overlay
});

// Function to show the register form
registerBtn.addEventListener('click', () => {
    registerForm.classList.remove('hidden'); // Display the register form
    overlay.style.display = 'block';         // Show the overlay
});

// Function to close the login form
closeLoginForm.addEventListener('click', () => {
    loginForm.classList.add('hidden');      // Hide the login form
    overlay.style.display = 'none';         // Hide the overlay
});

// Function to close the register form
closeRegisterForm.addEventListener('click', () => {
    registerForm.classList.add('hidden');   // Hide the register form
    overlay.style.display = 'none';         // Hide the overlay
});

// Close the forms if clicking outside the form area
overlay.addEventListener('click', () => {
    loginForm.classList.add('hidden');      // Hide the login form
    registerForm.classList.add('hidden');   // Hide the register form
    overlay.style.display = 'none';         // Hide the overlay
});
