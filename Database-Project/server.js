const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = 5000;

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "database", // Replace 'database' with your actual database name
});

app.use(cors());
app.use(bodyParser.json());

db.connect((err) => {
  if (err) {
    console.error("Database connection failed: " + err.stack);
    return;
  }
  console.log("Connected to database.");
});

app.post("/create-table", (req, res) => {
  const { tableName, fields } = req.body;

  if (!tableName || !fields || fields.length === 0) {
    return res.status(400).send("Table name and fields are required.");
  }

  const fieldDefinitions = fields
    .map((field) => `${field.name} ${field.type}`)
    .join(", ");
  const sql = `CREATE TABLE ${tableName} (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ${fieldDefinitions},
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`;

  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error creating table.");
    }
    db.query(`SHOW COLUMNS FROM ${tableName}`, (err, columns) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .send("Table created, but failed to fetch columns.");
      }
      // Filter out system-generated columns like id, created_at, and updated_at
      const headers = columns
        .filter(
          (column) => !["id", "created_at", "updated_at"].includes(column.Field)
        )
        .map((column) => column.Field);
      res.json({ message: "Table created successfully.", headers });
    });
  });
});

app.get("/tables", (req, res) => {
  db.query("SHOW TABLES", (err, result) => {
    if (err) {
      console.error("Error fetching tables:", err);
      return res.status(500).json({ error: "Error fetching tables." });
    }
    const tables = result.map((row) => Object.values(row)[0]);
    res.json(tables);
  });
});

app.get("/table/:name", (req, res) => {
  const tableName = req.params.name;
  db.query(`SELECT * FROM ${tableName}`, (err, result) => {
    if (err) {
      console.error(`Error fetching data from table ${tableName}:`, err);
      return res
        .status(500)
        .json({ error: `Error fetching data from table ${tableName}.` });
    }
    res.json(result);
  });
});

app.get("/table-columns/:name", (req, res) => {
  const tableName = req.params.name;
  db.query(`SHOW COLUMNS FROM ${tableName}`, (err, result) => {
    if (err) {
      console.error(`Error fetching columns from table ${tableName}:`, err);
      return res
        .status(500)
        .json({ error: `Error fetching columns from table ${tableName}.` });
    }
    // Filter out system-generated columns like id, created_at, and updated_at
    const columns = result
      .filter(
        (column) => !["id", "created_at", "updated_at"].includes(column.Field)
      )
      .map((column) => column.Field);
    res.json(columns);
  });
});

app.post("/insert-data/:name", (req, res) => {
  const tableName = req.params.name;
  const data = req.body;
  const columns = Object.keys(data).join(", ");
  const values = Object.values(data)
    .map((value) => mysql.escape(value))
    .join(", ");

  const sql = `INSERT INTO ${tableName} (${columns}) VALUES (${values})`;

  db.query(sql, (err, result) => {
    if (err) {
      console.error(`Error inserting data into table ${tableName}:`, err);
      return res
        .status(500)
        .send(`Error inserting data into table ${tableName}.`);
    }
    res.send("Data inserted successfully.");
  });
});

app.delete("/delete-data/:tableName/:id", (req, res) => {
  const { tableName, id } = req.params;
  const sql = `DELETE FROM ${tableName} WHERE id = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error(`Error deleting data from table ${tableName}:`, err);
      return res
        .status(500)
        .send(`Error deleting data from table ${tableName}.`);
    }
    res.send("Data deleted successfully.");
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
