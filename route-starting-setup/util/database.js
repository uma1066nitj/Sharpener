const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  database: "Practice",
  password: "root",
});

module.exports = pool.promise();
