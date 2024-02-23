const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "expense",
});

exports.addExpense = (req, res, next) => {
  const { money, service, service_category } = req.body;
  pool.query(
    "INSERT INTO expense (money, service, service_category) VALUES (?,?,?)",
    [money, service, service_category],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal Server Error" });
      }
      res.json({ message: "Expense added successfully" });
    }
  );
};

exports.deleteExpense = (req, res, next) => {
  const userId = req.params.userId;
  pool.query("DELETE FROM expense WHERE id = ?", [userId], (err, results) => {
    if (err) {
      console.error("Error deleting user: ", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
    res.json({ message: "Expense deleted successfully" });
  });
};

exports.getExpense = (req, res, next) => {
  pool.query("SELECT * FROM user", (err, results) => {
    if (err) {
      console.error("Error fetching users: ", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
    res.json(results);
  });
};
