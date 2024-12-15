const express = require("express");
const body_parser = require("body-parser");
const path = require("path");

const app = express();

// Middleware
app.use(body_parser.json());
app.use(express.static(path.join(__dirname, "public")));

// Sample Route
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Start Server
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});

// Route for Login page
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public/frontend/Login/login.html"));
});

// Route for Signup page
app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "public/frontend/Signup/signup.html"));
});
