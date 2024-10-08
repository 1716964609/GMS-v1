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
        alert('有効なユーザー名（フォーマットはメール）を入力してください。');
        return;
    }

    const csrf = await fetchCsrfToken(); // Get CSRF token
    const csrfToken = csrf.token;
    const csrfHeader = csrf.headerName;

    const user = {
        username: username,
        passwordHash: password,
        role:"USER"
    };

    const response = await fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            [csrfHeader]: csrfToken // Include CSRF token in header
        },
        body: JSON.stringify(user)
    });

    const result = await response.text();

    if (response.status === 400 && result === "ユーザー名（メール）すでに使用されています。") {
        alert('このユーザー名は既に使用されています。別のユーザー名を入力してください。');
    } else if (response.ok) {
        alert('登録に成功しました！');
        hideForms(); // Hide registration form
    } else {
        alert('登録に失敗しました。もう一度お試しください。');
    }
}


async function handleLogin(event) {
    event.preventDefault(); // Prevent form submission


    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!isValidEmail(username)) {
        alert('有効なユーザー名（フォーマットはメール）を入力してください。');
        return;
    }

    // Fetch CSRF token
    const csrf = await fetchCsrfToken(); // Ensure this is called before form submission
    const csrfToken = csrf.token;
    const csrfHeader = csrf.headerName;

console.log("csrf complete")


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
        window.location.href = response.url;
    } else if (response.status === 403) {
        const errorText = await response.text();
        alert("Login failed: " + errorText);
    } else {
        alert("ユーザー名またはパスワードが違います。");
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
