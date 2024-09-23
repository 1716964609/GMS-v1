document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    // Event listener for form submission
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission

        // Gather form data
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Create the payload
        const payload = {
            username: email,  // Spring Security expects the username field to be named 'username'
            password: password // Password field name should be 'password'
        };

        try {
            // Send POST request using fetch API
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // Specify JSON content type
                },
                body: JSON.stringify(payload) // Send the form data as JSON
            });

            if (response.ok) {
                // Handle success (you can redirect or show a message)
                const result = await response.text();
                console.log('Login successful:', result);
                window.location.href = '/admin/console'; // Redirect to user console
            } else {
                // Handle error (wrong credentials or other errors)
                const errorMessage = await response.text();
                console.error('Login failed:', errorMessage);
                alert('ログインに失敗しました。もう一度試してください。');
            }
        } catch (error) {
            console.error('Error during login:', error);
        }
    });
});
