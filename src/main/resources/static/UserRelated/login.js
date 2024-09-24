//document.addEventListener('DOMContentLoaded', () => {
//    const loginForm = document.getElementById('login-form');
//
//    // Event listener for form submission
//    loginForm.addEventListener('submit', async (event) => {
//        event.preventDefault(); // Prevent default form submission
//
//        // Gather form data
//        const email = document.getElementById('email').value;
//        const password = document.getElementById('password').value;
//
//        // Create the payload
//        const user = {
//            username: email,  // Spring Security expects the username field to be named 'username'
//            passwordHash: password, // Password field name should be 'password'
//            role:"";
//        };
//
//        try {
//            // Send POST request using fetch API
//            const response = await fetch('/login', {
//                method: 'POST',
//                headers: {
//                    'Content-Type': 'application/json' // Specify JSON content type
//                },
//                body: JSON.stringify(payload) // Send the form data as JSON
//            });
//
//            if (response.ok) {
//                // Handle success (you can redirect or show a message)
//                const result = await response.text();
//                console.log('Login successful:', result);
//                window.location.href = '/admin/console'; // Redirect to user console
//            } else {
//                // Handle error (wrong credentials or other errors)
//                const errorMessage = await response.text();
//                console.error('Login failed:', errorMessage);
//                alert('ログインに失敗しました。もう一度試してください。');
//            }
//        } catch (error) {
//            console.error('Error during login:', error);
//        }
//    });
//});
document.getElementById("login-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent form submission

    // Collect form data
    const loginData = {
        username: document.getElementById("email").value,  // Spring Security uses 'username' for email/username fields
        password: document.getElementById("password").value
    };

    // Send the login request to the server
    fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"  // Spring Security expects form-urlencoded format
        },
        body: `username=${encodeURIComponent(loginData.username)}&password=${encodeURIComponent(loginData.password)}`
    })
    .then(response => {
        if (response.redirected) {
            // If the login is successful, the response will redirect the user based on their role
            window.location.href = response.url;
        } else {
            // Handle failed login (if server returns non-redirect response)
            return response.text().then(text => {
                alert("Login failed: " + text);
            });
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("An error occurred during login.");
    });
});
