const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Razorpay = require("razorpay");

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
  const checkColumnQuery = `
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'expensetracker' 
    AND TABLE_NAME = 'users' 
    AND COLUMN_NAME = 'is_premium';
  `;
  db.query(checkColumnQuery, (err, results) => {
    if (err) {
      console.error("Error checking for 'is_premium' column:", err);
      return;
    }
    if (results.length === 0) {
      const addColumnQuery = `
        ALTER TABLE users 
        ADD COLUMN is_premium BOOLEAN DEFAULT FALSE;
      `;
      db.query(addColumnQuery, (err, result) => {
        if (err) {
          console.error(
            "Error adding 'is_premium' column to 'users' table:",
            err
          );
          return;
        }
        console.log("'is_premium' column added to 'users' table");
      });
    } else {
      console.log("'is_premium' column already exists in 'users' table");
    }
  });
});
// Add totalExpenses column if it doesn't exist
db.query(
  `
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'expensetracker' 
    AND TABLE_NAME = 'users' 
    AND COLUMN_NAME = 'totalExpenses';
    `,
  (err, results) => {
    if (err) {
      console.error("Error checking for 'totalExpenses' column:", err);
      return;
    }
    if (results.length === 0) {
      // If the column does not exist, add it
      db.query(
        `
          ALTER TABLE users 
          ADD COLUMN totalExpenses DECIMAL(10, 2) DEFAULT 0;
          `,
        (err) => {
          if (err) {
            console.error("Error adding totalExpenses column:", err);
          } else {
            console.log("totalExpenses column added to 'users' table");
          }
        }
      );
    } else {
      console.log("'totalExpenses' column already exists in 'users' table");
    }
  }
);
// Create the 'users' table if it doesn't exist
db.query(
  `
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_premium BOOLEAN DEFAULT FALSE,
        totalExpenses DECIMAL(10, 2) DEFAULT 0
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
// Create the 'orders' table if it doesn't exist
db.query(
  `
  CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(255) PRIMARY KEY,
    status VARCHAR(50) NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`,
  (err) => {
    if (err) {
      console.error("Error creating table:", err);
      return;
    }
    console.log('Table "orders" exists or was created');
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

// Delete expense endpoint
// app.delete("/delete-expense/:id", authenticate, (req, res) => {
//   const expenseId = req.params.id;
//   const userId = req.user.id;

//   db.beginTransaction((err) => {
//     if (err) {
//       console.error("Error starting transaction:", err);
//       res.status(500).send("Error starting transaction");
//       return;
//     }
//   const deleteExpenseQuery = `DELETE FROM expenses WHERE id = ? AND user_id = ?`;
//   db.query(deleteExpenseQuery, [expenseId, userId], (err, result) => {
//     if (err) {
//       console.error("Error deleting expense:", err);
//       db.rollback(() => {
//           res.status(500).send("Error fetching expense");
//         });
//       return;
//     }
//     res.send({ message: "Expense deleted successfully" });
//   });
//   const updateUserQuery = `
//         UPDATE users
//         SET totalExpenses = totalExpenses - ?
//         WHERE id = ?`;

//   db.query(updateUserQuery, [amount, userId], (err, updateResult) => {
//     if (err) {
//       console.error("Error updating total expenses:", err);
//       res.status(500).send("Error updating total expenses");
//       return;
//     }
//     res.send({ message: "Expense deleted successfully" });
//   });
// });
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
const Sib = require("sib-api-v3-sdk");
const defaultClient = Sib.ApiClient.instance;
const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey =
  "xsmtpsib-fd0992810eff873004ed64954c96d55f4ed65dfbe0136e1ed7992f0d2152bbcf-OjvTrxBsbY1FgyCE";
const apiInstance = new Sib.TransactionalEmailsApi();
app.post("/password/forgotpassword", async (req, res) => {
  const { email } = req.body;
  // Send dummy email using Sendinblue
  // const sendSmtpEmail = new Sib.SendSmtpEmail();
  // sendSmtpEmail.subject = "Forgot Password";
  // sendSmtpEmail.sender = {
  //   name: "Uma Shankar",
  //   email: "umashankarjha1066@gmail.com",
  // };
  // sendSmtpEmail.to = [{ email: email }];
  // sendSmtpEmail.htmlContent =
  //   "<p>This is a dummy email for password recovery.</p>";
  const sender = { email: "umashankarjha1066@gmail.com" };
  const recievers = { email: email };
  try {
    // const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    const response = await apiInstance.sendTransacEmail({
      sender,
      to: recievers,
      subject: "Forget Passward",
      textContent: `This is a dummy email for password recovery`,
    });
    res
      .status(200)
      .json({ message: "Forgot password email sent successfully." });
  } catch (error) {
    console.error("Error sending forgot password email:", error);
    res.status(500).json({ message: "Error sending forgot password email." });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
