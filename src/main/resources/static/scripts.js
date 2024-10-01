// scripts.js

// Get elements
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const overlay = document.createElement('div'); // Create overlay

// Set overlay styles
overlay.className = 'overlay';
document.body.appendChild(overlay);

// Function to show form
function showForm(form) {
    overlay.style.display = 'block'; // Show overlay
    form.style.display = 'block'; // Show form
}

// Function to hide forms
function hideForms() {
    overlay.style.display = 'none'; // Hide overlay
    loginForm.style.display = 'none'; // Hide login form
    registerForm.style.display = 'none'; // Hide register form
}

// Event Listeners
loginBtn.addEventListener('click', () => showForm(loginForm));
registerBtn.addEventListener('click', () => showForm(registerForm));

// Close button functionality
document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', hideForms);
});

// Close form when clicking outside of it
overlay.addEventListener('click', hideForms);
