const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Razorpay = require("razorpay");
const sgMail = require("@sendgrid/mail");
const dotenv = require("dotenv");
const { v4: uuidv4 } = require("uuid");
dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public"))); // Ensure this is correctly set

// JWT secret
const secret =
  "8ced1c626603c9084e88cea24778703e65603a9df89b0657510ba7f15c563c0c";

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

  const checkAndAddColumn = (table, column, type) => {
    const checkColumnQuery = `
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'expensetracker' 
      AND TABLE_NAME = '${table}' 
      AND COLUMN_NAME = '${column}';
    `;
    db.query(checkColumnQuery, (err, results) => {
      if (err) {
        console.error(`Error checking for '${column}' column:`, err);
        return;
      }
      if (results.length === 0) {
        const addColumnQuery = `ALTER TABLE ${table} ADD COLUMN ${column} ${type};`;
        db.query(addColumnQuery, (err) => {
          if (err) {
            console.error(
              `Error adding '${column}' column to '${table}' table:`,
              err
            );
            return;
          }
          console.log(`'${column}' column added to '${table}' table`);
        });
      } else {
        console.log(`'${column}' column already exists in '${table}' table`);
      }
    });
  };

  checkAndAddColumn("users", "is_premium", "BOOLEAN DEFAULT FALSE");
  checkAndAddColumn("users", "totalExpenses", "DECIMAL(10, 2) DEFAULT 0");
});

const createTable = (query, tableName) => {
  db.query(query, (err) => {
    if (err) {
      console.error(`Error creating table '${tableName}':`, err);
      return;
    }
    console.log(`Table '${tableName}' exists or was created`);
  });
};

createTable(
  `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      is_premium BOOLEAN DEFAULT FALSE,
      totalExpenses DECIMAL(10, 2) DEFAULT 0
    )`,
  "users"
);
createTable(
  `CREATE TABLE IF NOT EXISTS expenses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      description TEXT NOT NULL,
      category VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,
  "expenses"
);

createTable(
  `CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(255) PRIMARY KEY,
      status VARCHAR(50) NOT NULL,
      user_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,
  "orders"
);

// Create the 'ForgotPasswordRequests' table if it doesn't exist

createTable(
  `CREATE TABLE IF NOT EXISTS forgotPasswordRequests (
        id CHAR(36) PRIMARY KEY,
        userId INT NOT NULL,
        isActive BOOLEAN DEFAULT TRUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
    )`,
  "forgotPasswordRequests"
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

  db.beginTransaction((err) => {
    if (err) {
      console.error("Error starting transaction:", err);
      res.status(500).send("Error starting transaction");
      return;
    }
    // Check if the user already exists
    const checkUserQuery = "SELECT * FROM users WHERE email = ?";
    db.query(checkUserQuery, [email], async (err, results) => {
      if (err) {
        console.error("Error checking user:", err);
        db.rollback(() => {
          res.status(500).send("Error checking user");
        });
        return;
      }

      if (results.length > 0) {
        db.rollback(() => {
          res.status(409).send({ message: "User already exists" });
        });
        return;
      }

      // Hash the password before inserting into the database
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user into the database
      const insertUserQuery =
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
      db.query(
        insertUserQuery,
        [name, email, hashedPassword],
        (err, result) => {
          if (err) {
            if (err.code === "ER_DUP_ENTRY") {
              db.rollback(() => {
                res.status(409).send({ message: "User already exists" });
              });
            } else {
              console.error("Error inserting user:", err);
              db.rollback(() => {
                res.status(500).send("Error inserting user");
              });
            }
            return;
          }
          db.commit((err) => {
            if (err) {
              console.error("Error committing transaction:", err);
              db.rollback(() => {
                res.status(500).send("Error committing transaction");
              });
              return;
            }
            const token = generateToken({ id: result.insertId, email });

            res.send({ message: "User registered successfully", token });
          });
        }
      );
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

  db.beginTransaction((err) => {
    if (err) {
      console.error("Error starting transaction:", err);
      res.status(500).send("Error starting transaction");
      return;
    }

    const insertExpenseQuery = `
    INSERT INTO expenses (user_id, amount, description, category) 
    VALUES (?, ?, ?, ?)`;
    db.query(
      insertExpenseQuery,
      [userId, amount, description, category],
      (err, result) => {
        if (err) {
          console.error("Error inserting expense:", err);
          db.rollback(() => {
            res.status(500).send("Error inserting expense");
          });
        }
      }
    );
    const updateUserQuery = `
      UPDATE users 
      SET totalExpenses = totalExpenses + ? 
      WHERE id = ?`;

    db.query(updateUserQuery, [amount, userId], (err, updateResult) => {
      if (err) {
        console.error("Error updating total expenses:", err);
        db.rollback(() => {
          res.status(500).send("Error updating total expenses");
        });
      }
      db.commit((err) => {
        if (err) {
          console.error("Error committing transaction:", err);
          db.rollback(() => {
            res.status(500).send("Error committing transaction");
          });
          return;
        }
        res.send({ message: "Expense added successfully" });
      });
    });
  });
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

app.delete("/delete-expense/:id", authenticate, (req, res) => {
  const expenseId = req.params.id;
  const userId = req.user.id;

  db.beginTransaction((err) => {
    if (err) {
      console.error("Error starting transaction:", err);
      res.status(500).send("Error starting transaction");
      return;
    }

    const getExpenseQuery =
      "SELECT * FROM expenses WHERE id = ? AND user_id = ?";
    db.query(getExpenseQuery, [expenseId, userId], (err, results) => {
      if (err) {
        console.error("Error fetching expense:", err);
        db.rollback(() => {
          res.status(500).send("Error fetching expense");
        });
        return;
      }

      if (results.length === 0) {
        db.rollback(() => {
          res.status(404).send({ message: "Expense not found" });
        });
        return;
      }

      const expense = results[0];

      const deleteExpenseQuery = "DELETE FROM expenses WHERE id = ?";
      db.query(deleteExpenseQuery, [expenseId], (err, result) => {
        if (err) {
          console.error("Error deleting expense:", err);
          db.rollback(() => {
            res.status(500).send("Error deleting expense");
          });
          return;
        }

        const updateUserQuery = `
          UPDATE users 
          SET totalExpenses = totalExpenses - ? 
          WHERE id = ?`;
        db.query(updateUserQuery, [expense.amount, userId], (err, result) => {
          if (err) {
            console.error("Error updating totalExpenses:", err);
            db.rollback(() => {
              res.status(500).send("Error updating totalExpenses");
            });
            return;
          }

          db.commit((err) => {
            if (err) {
              console.error("Error committing transaction:", err);
              db.rollback(() => {
                res.status(500).send("Error committing transaction");
              });
              return;
            }
            res.send({ message: "Expense deleted successfully" });
          });
        });
      });
    });
  });
});

// Razorpay instance
const razorpay = new Razorpay({
  key_id: "rzp_test_SVqd0bGwM0MMD7",
  key_secret: "wjkeBBBHYQftSYcqYax4Dvkq",
});

// Create order endpoint
app.post("/create-order", authenticate, async (req, res) => {
  try {
    const options = {
      amount: 50000, // Amount in paise (INR 500.00)
      currency: "INR",
      receipt: "receipt#1",
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);
    const insertOrderQuery =
      "INSERT INTO orders (id, status, user_id) VALUES (?, 'PENDING', ?)";
    db.query(insertOrderQuery, [order.id, req.user.id], (err) => {
      if (err) {
        console.error("Error inserting order:", err);
        res.status(500).send("Error inserting order");
        return;
      }
      res.status(201).json(order);
    });
  } catch (error) {
    res.status(500).json({ message: "Order creation failed", error });
  }
});

// Verify order endpoint
app.post("/verify-order", authenticate, (req, res) => {
  const { order_id, payment_id, status } = req.body;

  if (!order_id || !status) {
    return res
      .status(400)
      .send({ message: "Order ID and status are required" });
  }
  const updateOrderQuery = "UPDATE orders SET status = ? WHERE id = ?";
  db.query(updateOrderQuery, [status, order_id], (err, result) => {
    if (err) {
      console.error("Error updating order status:", err);
      res.status(500).send("Error updating order status");
      return;
    }
    if (status === "SUCCESS") {
      const updateUserQuery = "UPDATE users SET is_premium = TRUE WHERE id = ?";
      db.query(updateUserQuery, [req.user.id], (err, result) => {
        if (err) {
          console.error("Error updating user status:", err);
          res.status(500).send("Error updating user status");
          return;
        }
        res.send({
          message: "Transaction successful, user upgraded to premium",
        });
      });
    } else {
      res.send({ message: "Transaction failed" });
    }
  });
});

// New endpoint to check premium status
app.get("/check-premium-status", authenticate, (req, res) => {
  const userId = req.user.id;

  const checkPremiumQuery = "SELECT is_premium FROM users WHERE id = ?";
  db.query(checkPremiumQuery, [userId], (err, results) => {
    if (err) {
      console.error("Error checking premium status:", err);
      res.status(500).send("Error checking premium status");
      return;
    }
    if (results.length === 0) {
      res.status(404).send({ message: "User not found" });
      return;
    }

    const isPremium = results[0].is_premium;
    res.send({ isPremium });
  });
});
// Endpoint to get the leaderboard data
app.get("/leaderboard", authenticate, (req, res) => {
  const userId = req.user.id;

  // Check if the user is premium
  const checkPremiumQuery = "SELECT is_premium FROM users WHERE id = ?";
  db.query(checkPremiumQuery, [userId], (err, results) => {
    if (err) {
      console.error("Error checking premium status:", err);
      res.status(500).send("Error checking premium status");
      return;
    }

    if (results.length === 0 || !results[0].is_premium) {
      res.status(403).send({ message: "Access denied. Not a premium user." });
      return;
    }

    // Query to get the leaderboard data
    const leaderboardQuery = `
      SELECT users.name, SUM(expenses.amount) AS total_expense 
      FROM users 
      JOIN expenses ON users.id = expenses.user_id 
      GROUP BY users.id 
      ORDER BY total_expense DESC
    `;

    db.query(leaderboardQuery, (err, results) => {
      if (err) {
        console.error("Error fetching leaderboard data:", err);
        res.status(500).send("Error fetching leaderboard data");
        return;
      }

      res.send(results);
    });
  });
});
// const API_KEY =
//   "SG.tm1ljY9yStyXp1lbvKkLQg.flv63jZ7ZXqV3cOVr8oNVtdyfjtQqlV-SL22pgImMfcnpm";
sgMail.setApiKey(
  "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"
);
app.post("/password/forgotpassword", async (req, res) => {
  const { email } = req.body;

  console.log("Received forgot password request for email:", email);

  // Check if user exists in the database
  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) {
      console.error("Error checking user:", err);
      return res.status(500).send("Error checking user");
    }

    if (results.length === 0) {
      return res.status(404).send({ message: "User not found" });
    }

    const user = results[0];
    const id = uuidv4();

    // Insert reset token into database
    db.query(
      "INSERT INTO ForgotPasswordRequests (id, userId, isActive) VALUES (?, ?, TRUE)",
      [id, user.id],
      (err, result) => {
        if (err) {
          console.error("Error inserting forgot password request:", err);
          return res
            .status(500)
            .send("Error inserting forgot password request");
        }

        const resetUrl = `http://localhost:3000/password/reset-password/${id}`;

        const msg = {
          to: email,
          from: "umashankarofficial19@gmail.com", // Update with your verified sender email
          subject: "Reset your password",
          text: `Please use the following link to reset your password: ${resetUrl}`,
          html: `<p>Please use the following link to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`,
        };

        sgMail
          .send(msg)
          .then(() => {
            res
              .status(200)
              .json({ message: "Forgot password email sent successfully." });
          })
          .catch((error) => {
            console.error("Error sending forgot password email:", error);
            res
              .status(500)
              .json({ message: "Error sending forgot password email." });
          });
      }
    );
  });
});
// Endpoint to handle reset password request
app.get("/password/reset-password/:id", (req, res) => {
  const id = req.params.id;

  db.query(
    "SELECT * FROM ForgotPasswordRequests WHERE id = ? AND isActive = TRUE",
    [id],
    (err, results) => {
      if (err) {
        console.error("Error checking forgot password request:", err);
        return res.status(500).send("Error checking forgot password request");
      }

      if (results.length === 0) {
        return res
          .status(404)
          .send({ message: "Invalid or expired reset link" });
      }

      res.status(200).send(`
            <html>
                <script>
            function formsubmitted(e) {
              e.preventDefault();
              const form = e.target;
              const formData = new FormData(form);
              const payload = {};
              formData.forEach((value, key) => {
                payload[key] = value;
              });

              fetch(form.action, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
              })
              .then(response => response.json())
              .then(data => {
                alert(data.message);
              })
              .catch(error => {
                console.error("Error updating password:", error);
                alert("Error updating password");
              });
            }
          </script>
                <form action="/password/update-password/${id}" method="post">
                    <label for="newpassword">Enter New password</label>
                    <input name="password" type="password" required></input>
                    <button type="submit">reset password</button>
                </form>
            </html>
        `);
    }
  );
});

// app.post("/forgot-password", async (req, res) => {
//   const { email } = req.body;

//   console.log("Received forgot password request for email:", email);
//   const checkUserQuery = "SELECT * FROM users WHERE email = ?";
//   db.query(checkUserQuery, [email], async (err, results) => {
//     if (err) {
//       console.error("Error checking user:", err);
//       return res.status(500).send("Error checking user");
//     }

//     if (results.length === 0) {
//       return res.status(404).send({ message: "User not found" });
//     }
//     const user = results[0];
//     const id = uuidv4();

//     const insertForgotPasswordQuery = `
//       INSERT INTO ForgotPasswordRequests (id, userId, isActive)
//       VALUES (?, ?, TRUE)
//     `;
//     db.query(insertForgotPasswordQuery, [id, user.id], (err, result) => {
//       if (err) {
//         console.error("Error inserting forgot password request:", err);
//         return res.status(500).send("Error inserting forgot password request");
//       }
//       const resetUrl = `http://localhost:3000/password/reset-password/${id}`;

//       const msg = {
//         to: email,
//         from: "umashankarjha1066@gmail.com",
//         subject: "Reset your password",
//         text: `Please use the following link to reset your password: ${resetUrl}`,
//         html: `<p>Please use the following link to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`,
//       };

//       sgMail
//         .send(msg)
//         .then(() => {
//           res.send({ message: "Reset password email sent successfully" });
//         })
//         .catch((error) => {
//           console.error("Error sending email:", error);
//           res.status(500).send("Error sending reset password email");
//         });
//     });
//   });
// });
// Endpoint to handle updating the password
app.post("/password/update-password/:id", async (req, res) => {
  const id = req.params.id;
  const { password } = req.body;
  console.log("Received request to update password for ID:", id);
  console.log("Password:", password);
  if (!password) {
    return res.status(400).send({ message: "Password is required" });
  }
  db.query(
    "SELECT * FROM ForgotPasswordRequests WHERE id = ? AND isActive = TRUE",
    [id],
    async (err, results) => {
      if (err) {
        console.error("Error checking forgot password request:", err);
        return res.status(500).send("Error checking forgot password request");
      }

      if (results.length === 0) {
        return res
          .status(404)
          .send({ message: "Invalid or expired reset link" });
      }

      const forgotPasswordRequest = results[0];

      try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update the user's password
        db.query(
          "UPDATE users SET password = ? WHERE id = ?",
          [hashedPassword, forgotPasswordRequest.userId],
          (err, result) => {
            if (err) {
              console.error("Error updating password:", err);
              return res.status(500).send("Error updating password");
            }

            // Deactivate the reset token
            db.query(
              "UPDATE ForgotPasswordRequests SET isActive = FALSE WHERE id = ?",
              [id],
              (err, result) => {
                if (err) {
                  console.error(
                    "Error deactivating forgot password request:",
                    err
                  );
                  return res
                    .status(500)
                    .send("Error deactivating forgot password request");
                }

                res.send({ message: "Password updated successfully" });
              }
            );
          }
        );
      } catch (error) {
        console.error("Error hashing password:", error);
        res.status(500).send("Error hashing password");
      }
    }
  );
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
