document.getElementById("register-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent form submission

    const user = {
        username: document.getElementById("username").value,
        passwordHash: document.getElementById("password").value,
        role:"USER"
    };

    fetch("/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(user) // Send the user object as a JSON string
    })
    .then(response => response.json())
    .then(data => {
        if (data === "User registered successfully") {
            alert("Registration successful!");
        } else {
            alert("Error: " + data);
        }
    })
    .catch(error => console.error("Error:", error));
});
