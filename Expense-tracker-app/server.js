const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public"))); // Ensure this is correctly set

// JWT secret
const secret = "your_jwt_secret";

// Create a MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "expensetracker",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL");
});

// Create the 'users' table if it doesn't exist
db.query(
  `
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
`,
  (err, result) => {
    if (err) {
      console.error("Error creating table:", err);
      return;
    }
    console.log('Table "users" exists or was created');
  }
);

// Create the 'expenses' table if it doesn't exist
db.query(
  `
    CREATE TABLE IF NOT EXISTS expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
`,
  (err, result) => {
    if (err) {
      console.error("Error creating table:", err);
      return;
    }
    console.log('Table "expenses" exists or was created');
  }
);

// JWT utility functions
function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, secret, {
    expiresIn: "1h",
  });
}

function verifyToken(token) {
  return jwt.verify(token, secret);
}

// Signup endpoint
app.post("/signup", (req, res) => {
  const { name, email, password } = req.body;

  // Check if the user already exists
  const checkUserQuery = "SELECT * FROM users WHERE email = ?";
  db.query(checkUserQuery, [email], async (err, results) => {
    if (err) {
      console.error("Error checking user:", err);
      res.status(500).send("Error checking user");
      return;
    }

    if (results.length > 0) {
      res.status(409).send({ message: "User already exists" });
      return;
    }

    // Hash the password before inserting into the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into the database
    const insertUserQuery =
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    db.query(insertUserQuery, [name, email, hashedPassword], (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          res.status(409).send({ message: "User already exists" });
        } else {
          console.error("Error inserting user:", err);
          res.status(500).send("Error inserting user");
        }
        return;
      }
      const token = generateToken({ id: result.insertId, email });

      res.send({ message: "User registered successfully", token });
    });
  });
});

// Login endpoint
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const checkUserQuery = "SELECT * FROM users WHERE email = ?";
  db.query(checkUserQuery, [email], async (err, results) => {
    if (err) {
      console.error("Error checking user:", err);
      res.status(500).send("Error checking user");
      return;
    }
    if (results.length === 0) {
      res.status(404).send({ message: "User not found" });
      return;
    }

    const user = results[0];

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      res.status(401).send({ message: "User not authorized" });
      return;
    }
    const token = generateToken(user);
    res.send({ message: "User login successful", token });
  });
});

// Middleware to authenticate and identify the user
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).send({ message: "No token provided" });
  }
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).send({ message: "Invalid token" });
  }
}

// Add expense endpoint
app.post("/add-expense", authenticate, (req, res) => {
  const { amount, description, category } = req.body;
  const userId = req.user.id;
  const insertExpenseQuery = `
    INSERT INTO expenses (user_id, amount, description, category) 
    VALUES (?, ?, ?, ?)`;
  db.query(
    insertExpenseQuery,
    [userId, amount, description, category],
    (err, result) => {
      if (err) {
        console.error("Error inserting expense:", err);
        res.status(500).send("Error inserting expense");
        return;
      }
      res.send({ message: "Expense added successfully" });
    }
  );
});

// Get expenses endpoint
app.get("/get-expenses", authenticate, (req, res) => {
  const userId = req.user.id;
  // Retrieve expenses data from the database
  const getExpensesQuery = `SELECT * FROM expenses WHERE user_id=?`;
  db.query(getExpensesQuery, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching expenses:", err);
      res.status(500).send("Error fetching expenses");
      return;
    }
    res.send(results); // Send the expenses data back to the client
  });
});

// Delete expense endpoint
app.delete("/delete-expense/:id", authenticate, (req, res) => {
  const expenseId = req.params.id;
  const userId = req.user.id;

  const deleteExpenseQuery = `DELETE FROM expenses WHERE id = ? AND user_id = ?`;
  db.query(deleteExpenseQuery, [expenseId, userId], (err, result) => {
    if (err) {
      console.error("Error deleting expense:", err);
      res.status(500).send("Error deleting expense");
      return;
    }
    res.send({ message: "Expense deleted successfully" });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
