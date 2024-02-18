const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "appointment",
});

exports.addUser = (req, res) => {
  const { name, email, contact } = req.body;
  pool.query(
    "INSERT INTO user (name, email, contact) VALUES (?, ?, ?)",
    [name, email, contact],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal Server Error" });
      }
      res.json({ message: "User added successfully" });
    }
  );
};

exports.deleteUser = (req, res) => {
  const userId = req.params.userId;
  pool.query("DELETE FROM user WHERE id = ?", [userId], (err, results) => {
    if (err) {
      console.error("Error deleting user: ", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
    res.json({ message: "User deleted successfully" });
  });
};

exports.getAllUsers = (req, res) => {
  pool.query("SELECT * FROM user", (err, results) => {
    if (err) {
      console.error("Error fetching users: ", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
    res.json(results);
  });
};
