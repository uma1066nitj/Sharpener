const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// HTML for login
const loginPage = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
</head>
<body>
    <form action="/login" method="post">
        <label for="username">Username:</label>
        <input type="text" id="username" name="username" required>
        <button type="submit">Login</button>
    </form>
</body>
</html>
`;

// HTML for the main page
const mainPage = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Group Chat</title>
</head>
<body>
<div id="messages"></div>
    <form action="/send-message" method="post">
        <label for="message">Message:</label>
        <input type="text" id="message" name="message" required>
        <input type="hidden" id="username" name="username" value="">
        <button type="submit">Send</button>
    </form>

    

    <script>
        // Set the username from local storage
        const username = window.localStorage.getItem('username');
        document.getElementById('username').value = username;

        // Fetch and display messages
        function fetchMessages() {
            fetch('/get-messages')
                .then(response => response.text())
                .then(function(messages) {
                    document.getElementById('messages').innerHTML = messages;
                });
        }

        // Submit message form
        document.querySelector('form').addEventListener('submit', function (e) {
            e.preventDefault();
            const messageInput = document.getElementById('message');
            const message = messageInput.value.trim();

            if (message !== '') {
                // Send the message to the server
                fetch('/send-message', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: 'username=' + username + '&message=' + message,
                }).then(function() {
                    // Clear the input field
                    messageInput.value = '';
                });
            }
        });

        setInterval(fetchMessages, 1000); // Fetch messages every second
    </script>
</body>
</html>
`;

// Endpoint for the login page
app.get("/login", (req, res) => {
  res.send(loginPage);
});

// Endpoint for handling login
app.post("/login", (req, res) => {
  const username = req.body.username;
  // Store the username in local storage
  res.send(
    `<script>window.localStorage.setItem('username', '${username}'); window.location.href = '/';</script>`
  );
});

// Endpoint for the main page
app.get("/", (req, res) => {
  res.send(mainPage);
});

// Endpoint for handling messages
app.post("/send-message", (req, res) => {
  const username = req.body.username;
  const message = req.body.message;

  // Store the message in a file
  fs.appendFileSync("messages.txt", `${username}: ${message}\n`);

  // Respond with the updated list of messages
  const messages = fs.readFileSync("messages.txt", "utf8");
  res.send(messages);
});

// Endpoint for retrieving messages
app.get("/get-messages", (req, res) => {
  // Read messages from the file
  const messages = fs.readFileSync("messages.txt", "utf8");
  res.send(messages);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
