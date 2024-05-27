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
    const fieldName = field.name.includes(" ")
      ? `\`${field.name}\``
      : field.name;
    return `${fieldName} ${field.type}`; // Assuming field.type is a valid MySQL data type
  });

  // Add the 'id' field definition to the array of field definitions
  const allFieldDefinitions = [
    ...fieldDefinitions,
    "Id INT AUTO_INCREMENT PRIMARY KEY",
  ];

  // Join field definitions into a comma-separated string
  const fieldDefinitionsString = allFieldDefinitions.join(", ");

  // SQL query to create the table
  const createTableQuery = `CREATE TABLE ${tableName} (${fieldDefinitionsString})`;

  // Execute the SQL query to create the table
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
    const tableNames = results.map((row) => row[`Tables_in_dbmanagement`]);

    // Send the list of table names as JSON response
    res.json({ tables: tableNames }); // Wrap the array in an object
  });
});

// Route to fetch data for a specific table
app.get("/table/:tableName", (req, res) => {
  const tableName = req.params.tableName;

  // Query to fetch data from the specified table excluding the 'id' field
  const query = `SELECT * FROM ${tableName} WHERE id > 1`;

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
// Route to delete a record from the table
app.delete("/table/:tableName/:recordId", (req, res) => {
  const tableName = req.params.tableName;
  const recordId = req.params.recordId;

  // SQL query to delete the record
  const deleteQuery = `DELETE FROM ${tableName} WHERE id = ?`; // Assuming there's an 'id' column as primary key

  // Execute the SQL query
  pool.query(deleteQuery, [recordId], (err, result) => {
    if (err) {
      console.error("Error deleting record:", err);
      res.status(500).json({ error: "Error deleting record" });
      return;
    }

    console.log("Record deleted successfully");
    res.status(200).json({ message: "Record deleted successfully" });
  });
});

// Route to insert a new record into the table
app.post("/table/:tableName/insert", (req, res) => {
  const tableName = req.params.tableName;
  const recordData = req.body;

  // SQL query to insert the new record
  const insertQuery = `INSERT INTO ${tableName} SET ?`;

  // Execute the SQL query
  pool.query(insertQuery, recordData, (err, result) => {
    if (err) {
      console.error("Error inserting record:", err);
      res.status(500).json({ error: "Error inserting record" });
      return;
    }

    console.log("Record inserted successfully");
    res.status(200).json({ message: "Record inserted successfully" });
  });
});
// Route to fetch fields of a specific table
app.get("/table/:tableName/fields", (req, res) => {
  const tableName = req.params.tableName;

  // Query to fetch fields of the specified table
  const query = `DESCRIBE ${tableName}`;

  // Execute the SQL query
  pool.query(query, (err, results) => {
    if (err) {
      console.error(`Error fetching fields from table ${tableName}:`, err);
      res
        .status(500)
        .json({ error: `Error fetching fields from table ${tableName}` });
      return;
    }

    // Extract field names from the query results
    const fieldNames = results.map((row) => ({
      name: row.Field,
      type: row.Type,
    }));

    // Send the list of field names as JSON response
    res.json({ fields: fieldNames }); // Wrap the array in an object
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
