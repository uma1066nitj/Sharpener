const mysql = require("mysql2");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = 3000;

// Create a MySQL connection
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "dbmanagement",
});

// Middleware for parsing JSON body
app.use(cors());
app.use(bodyParser.json());

// Route for creating a table and inserting data
app.post("/createTable", (req, res) => {
  const { tableName, fields } = req.body;

  // Construct an array of field definitions
  const fieldDefinitions = fields.map((field) => {
    return `${field.name} ${field.type}`; // Assuming field.type is a valid MySQL data type
  });

  // Join field definitions into a comma-separated string
  const fieldDefinitionsString = fieldDefinitions.join(", ");

  // SQL query to create the table
  const createTableQuery = `CREATE TABLE ${tableName} (${fieldDefinitionsString})`;

  // Execute the SQL query
  pool.query(createTableQuery, (err, result) => {
    if (err) {
      console.error("Error creating table:", err);
      res.status(500).json({ error: "Error creating table" });
      return;
    }
    console.log("Table created successfully");
    res.status(200).json({ message: "Table created successfully" });
  });
});

// Route to fetch list of table names
app.get("/tables", (req, res) => {
  // Query to fetch table names from the database
  const query = "SHOW TABLES";

  // Execute the SQL query
  pool.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching table names:", err);
      res.status(500).json({ error: "Error fetching table names" });
      return;
    }

    // Extract table names from the query results
    const tableNames = results.map(
      (row) => row[`Tables_in_${pool.config.database}`]
    );

    // Send the list of table names as JSON response
    res.json(tableNames);
  });
});

// Route to fetch data for a specific table
app.get("/table/:tableName", (req, res) => {
  const tableName = req.params.tableName;

  // Query to fetch data from the specified table
  const query = `SELECT * FROM ${tableName}`;

  // Execute the SQL query
  pool.query(query, (err, results) => {
    if (err) {
      console.error(`Error fetching data from table ${tableName}:`, err);
      res
        .status(500)
        .json({ error: `Error fetching data from table ${tableName}` });
      return;
    }

    // Send the fetched data as JSON response
    res.json(results);
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
