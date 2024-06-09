const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public"))); // Ensure this is correctly set

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
// Create the 'expensetable' table if it doesn't exist
db.query(
  `
    CREATE TABLE IF NOT EXISTS expensetable (
        id INT AUTO_INCREMENT PRIMARY KEY,
        amount DECIMAL(10, 2) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
`,
  (err, result) => {
    if (err) {
      console.error("Error creating table:", err);
      return;
    }
    console.log('Table "expense table" exists or was created');
  }
);

// Handle form submission
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
      res.send({ message: "User registered successfully" });
    });
  });
});

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

    res.send({ message: "User login successful" });
  });
});

app.post("/add-expense", (req, res) => {
  const { amount, description, category } = req.body;

  const insertExpenseQuery = `
    INSERT INTO expensetable (amount, description, category) 
    VALUES (?, ?, ?)`;
  db.query(
    insertExpenseQuery,
    [amount, description, category],
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
app.get("/get-expenses", (req, res) => {
  // Retrieve expenses data from the database
  const getExpensesQuery = `SELECT * FROM expensetable`;
  db.query(getExpensesQuery, (err, results) => {
    if (err) {
      console.error("Error fetching expenses:", err);
      res.status(500).send("Error fetching expenses");
      return;
    }
    res.send(results); // Send the expenses data back to the client
  });
});

app.delete("/delete-expense/:id", (req, res) => {
  const expenseId = req.params.id;

  const deleteExpenseQuery = `DELETE FROM expensetable WHERE id = ?`;
  db.query(deleteExpenseQuery, [expenseId], (err, result) => {
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
