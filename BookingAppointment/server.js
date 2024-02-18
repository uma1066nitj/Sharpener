const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "appointment",
});

app.use(bodyParser.json());
app.post("/api/users", (req, res, next) => {
  const { name, email, contact } = req.body;
  pool.query(
    "insert into user (name, email,contact) values (?,?,?)",
    [name, email, contact],
    (err, result) => {
      if (err) {
        console.log(err);
        return;
      }
      res.json({ message: "user added successfully" });
    }
  );
});

app.delete("/api/users/:userId", (req, res) => {
  const userId = req.params.userId;
  pool.query("DELETE FROM user WHERE id = ?", [userId], (err, results) => {
    if (err) {
      console.error("Error deleting user: ", err);
      return;
    }
    res.json({ message: "User deleted successfully" });
  });
});

app.get("/api/users", (req, res) => {
  pool.query("SELECT * FROM user", (err, results) => {
    if (err) {
      console.error("Error fetching users: ", err);
      return;
    }
    res.json(results);
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
