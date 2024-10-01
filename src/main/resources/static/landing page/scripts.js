// // Get elements
// const loginBtn = document.getElementById('loginBtn');
// const registerBtn = document.getElementById('registerBtn');
// const loginForm = document.getElementById('loginForm');
// const registerForm = document.getElementById('registerForm');
// const overlay = document.createElement('div'); // Create overlay

// // Set overlay styles
// overlay.className = 'overlay';
// document.body.appendChild(overlay);

// // Function to show form
// function showForm(form) {
//     overlay.style.display = 'block'; // Show overlay
//     form.style.display = 'block'; // Show form
// }

// // Function to hide forms
// function hideForms() {
//     overlay.style.display = 'none'; // Hide overlay
//     loginForm.style.display = 'none'; // Hide login form
//     registerForm.style.display = 'none'; // Hide register form
// }





// // Event Listeners
// loginBtn.addEventListener('click', () => showForm(loginForm));
// registerBtn.addEventListener('click', () => showForm(registerForm));

// // Close button functionality
// document.querySelectorAll('.close-btn').forEach(btn => {
//     btn.addEventListener('click', hideForms);
// });

// // Close form when clicking outside of it
// overlay.addEventListener('click', hideForms);


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

// // Function to fetch CSRF token
// async function fetchCsrfToken() {
//     const response = await  fetch("/csrf-token", {
//         method: "GET"
//     });
//     const data = await response.json();
// }

async function fetchCsrfToken() {
    const response = await fetch('/csrf-token'); // Adjust the URL based on your backend
    if (!response.ok) {
        throw new Error('Failed to fetch CSRF token');
    }
    return response.json(); // Ensure this returns { token: '...', headerName: '...' }
}


// Function to validate email format
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Handle registration
async function handleRegister(event) {
    event.preventDefault(); // Prevent form submission

    const username = document.getElementById('usernameReg').value;
    const password = document.getElementById('passwordReg').value;

    if (!isValidEmail(username)) {
        alert('Please enter a valid email address.');
        return;
    }

    const csrfToken = await fetchCsrfToken(); // Get CSRF token

    const user = {
        username: username,
        passwordHash: password,
        role: "USER"
    };

    const response = await fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken // Include CSRF token in header
        },
        body: JSON.stringify(user)
    });

    const result = await response.text();
    alert(result); // Show registration response
    hideForms(); // Hide registration form
}

async function handleLogin(event) {
    event.preventDefault(); // Prevent form submission

    // Fetch CSRF token
    const csrf = await fetchCsrfToken(); // Ensure this is called before form submission
    const csrfToken = csrf.token;
    const csrfHeader = csrf.headerName;

console.log("csrf complete")

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!isValidEmail(username)) {
        alert('Please enter a valid email address.');
        return;
    }

console.log("email validation complete")

    // Prepare login data
    const loginData = {
        username: username,
        password: password // Use 'password' if that's what your backend expects
    };

console.log("loginData wraped")
    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            [csrfHeader]: csrfToken// Include CSRF token in header
        },
        body: `username=${encodeURIComponent(loginData.username)}&password=${encodeURIComponent(loginData.password)}`
    });

    console.log("api call finished")
    if (response.redirected) {
        // If the login is successful, the response will redirect the user based on their role
        window.location.href = response.url;
    } else {
        // Handle failed login
        const errorText = await response.text();
        alert("Login failed: " + errorText);
    }
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

// Attach event listeners to forms
loginForm.querySelector('form').addEventListener('submit', handleLogin);
registerForm.querySelector('form').addEventListener('submit', handleRegister);
