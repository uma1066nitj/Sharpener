window.addEventListener("DOMContentLoaded", (e) => {
  const createNewTableBtn = document.getElementById("createNewTableBtn");
  const createForm = document.getElementById("createForm");
  const addFieldBtn = document.getElementById("addFieldBtn");
  const createTableBtn = document.getElementById("createTable");
  const tableList = document.getElementById("tableList");

  // Add event listener for creating a new table button
  createNewTableBtn.addEventListener("click", () => {
    createForm.style.display = "block";
  });

  // Add event listener for adding fields to the form
  addFieldBtn.addEventListener("click", () => {
    const fields = document.getElementById("fields");
    const field = document.createElement("div");
    field.classList.add("field");
    field.innerHTML = `
            <input type="text" class="fieldName" placeholder="Field Name">
            <select class="fieldType">
                <option>Select type</option>
                <option value="INT">INT</option>
                <option value="VARCHAR(255)">VARCHAR(255)</option>
                <option value="DATE">DATE</option>
                <option value="BOOLEAN">BOOLEAN</option>
            </select>
        `;
    fields.appendChild(field);
  });

  // Add event listener for creating a table
  //   createTableBtn.addEventListener("click", (e) => {
  //     e.preventDefault();
  //     // Your create table logic
  //     // ...
  //   });
  createTableBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const tableNameInput = document.getElementById("tableName");
    const tableName = tableNameInput.value.trim();
    const fields = document.querySelectorAll(".field");

    if (tableName === "") {
      alert("Please enter a table name");
      return;
    }

    const fieldList = [];
    fields.forEach((field) => {
      const fieldName = field.querySelector(".fieldName").value.trim();
      const fieldType = field.querySelector(".fieldType").value.trim();

      if (fieldName !== "" && fieldType !== "Select type") {
        fieldList.push({ name: fieldName, type: fieldType });
      }
    });

    const formData = {
      tableName: tableName,
      fields: fieldList,
    };

    // Send a POST request to the server to create the table
    fetch("http://localhost:3000/createTable", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data); // You can handle success response here
        // alert("Table created successfully");
        const closeFormBtn = document.getElementById("closeFormBtn");
        closeFormBtn.addEventListener("click", () => {
          createForm.style.display = "none";
        });

        // Create button for the created table name
        const tableButton = document.createElement("button");
        tableButton.textContent = tableName;
        tableButton.dataset.tableName = tableName; // Store table name as dataset for later retrieval
        tableList.appendChild(tableButton);

        // Add event listener to fetch and display table data upon button click
        tableButton.addEventListener("click", () => {
          fetchTableData(tableName);
        });
      })
      .catch((error) => {
        console.error("There was a problem with the request:", error);
        alert("Failed to create table");
      });
  });

  // Fetch existing tables when the page loads
  fetchExistingTables();

  async function fetchExistingTables() {
    try {
      const response = await fetch("http://localhost:3000/tables");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      if (data.tables && data.tables.length > 0) {
        data.tables.forEach((tableName) => {
          createTableButton(tableName);
        });
      } else {
        console.log("No tables found.");
      }
    } catch (error) {
      console.error("There was a problem with the request:", error);
      alert("Failed to fetch existing tables");
    }
  }

  // Function to create a button for each table
  function createTableButton(tableName) {
    const tableButton = document.createElement("button");
    tableButton.textContent = tableName;
    tableButton.dataset.tableName = tableName; // Store table name as dataset for later retrieval
    tableList.appendChild(tableButton);

    // Add event listener to fetch and display table data upon button click
    tableButton.addEventListener("click", () => {
      const clickedTableName = tableButton.dataset.tableName;
      fetchTableData(clickedTableName);
    });
  }

  async function fetchTableData(tableName) {
    try {
      const response = await fetch(`http://localhost:3000/table/${tableName}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log("Fetched data:", data);

      const tableContainer = document.getElementById("tableContainer");
      tableContainer.innerHTML = ""; // Clear the table container

      const table = document.createElement("table");
      table.classList.add("table");

      const thead = document.createElement("thead");
      const trHeader = document.createElement("tr");
      if (data && data.length > 0) {
        Object.keys(data[0]).forEach((key) => {
          const th = document.createElement("th");
          th.textContent = key;
          trHeader.appendChild(th);
        });
        // Add an additional th element for the actions
        trHeader.innerHTML += "<th>Actions</th>";
      }

      thead.appendChild(trHeader);
      table.appendChild(thead);

      const tbody = document.createElement("tbody");
      data.forEach((row) => {
        const tr = document.createElement("tr");
        Object.values(row).forEach((value) => {
          const td = document.createElement("td");
          td.textContent = value;
          tr.appendChild(td);
        });

        // Add delete button only if there are records
        if (data.length > 0) {
          const deleteButton = document.createElement("button");
          deleteButton.textContent = "Delete";
          deleteButton.addEventListener("click", async () => {
            // Your delete record logic here
            // For example, you can send a request to your server to delete the record from the table
            // alert("Delete record logic here");
            try {
              const deleteResponse = await fetch(
                `http://localhost:3000/table/${tableName}/${row.id}`,
                {
                  method: "DELETE",
                }
              );
              if (!deleteResponse.ok) {
                throw new Error("Failed to delete record");
              }
              // If deletion is successful, reload table data
              fetchTableData(tableName);
            } catch (error) {
              console.error("Error deleting record:", error);
              alert("Failed to delete record");
            }
          });
          const tdActions = document.createElement("td");
          tdActions.appendChild(deleteButton);
          tr.appendChild(tdActions);
        }

        tbody.appendChild(tr);
      });

      table.appendChild(tbody);

      tableContainer.appendChild(table);

      // Create "Insert Records" button dynamically if it doesn't exist
      if (!document.querySelector(".insert-records-btn")) {
        const insertRecordsBtn = document.createElement("button");
        insertRecordsBtn.textContent = "Insert Records";
        insertRecordsBtn.classList.add("insert-records-btn");
        insertRecordsBtn.addEventListener("click", () => {
          fetchTableFields(tableName)
            .then((tableFields) => {
              // Once table fields are fetched, pass them to displayInsertForm
              console.log(tableFields);
              displayInsertForm(tableName, tableFields);
            })
            .catch((error) => {
              console.error("Error fetching table fields:", error);
              alert("Failed to fetch table fields");
            });
        });

        // Insert the dynamically created button before the table container
        tableContainer.parentNode.insertBefore(
          insertRecordsBtn,
          tableContainer
        );
      }

      // Show the table container
      tableContainer.style.display = "block";
    } catch (error) {
      console.error("There was a problem with the request:", error);
      alert(`Failed to fetch data for table: ${tableName}`);
    }
  }
  async function fetchTableFields(tableName) {
    try {
      const response = await fetch(
        `http://localhost:3000/table/${tableName}/fields`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data.fields; // Assuming fields is an array of field objects with name and type properties
    } catch (error) {
      console.error("Error fetching table fields:", error);
      throw error;
    }
  }

  function displayInsertForm(tableName, tableFields) {
    // Check if formContainer exists, create it if not
    let formContainer = document.getElementById("formContainer");
    if (!formContainer) {
      formContainer = document.createElement("div");
      formContainer.id = "formContainer";

      document.body.appendChild(formContainer);
    }

    formContainer.innerHTML = "";
    const overlay = document.createElement("div");
    overlay.classList.add("overlay");
    formContainer.appendChild(overlay);

    // Create close button
    const closeButton = document.createElement("button");
    closeButton.textContent = "X";
    closeButton.classList.add("close-insert-form");
    overlay.appendChild(closeButton);

    // Add event listener to close button
    closeButton.addEventListener("click", () => {
      formContainer.style.display = "none";
      overlay.style.display = "none";
    }); // Clear any existing content

    const form = document.createElement("form");
    form.classList.add("insert-form-container");

    // Create input fields based on the table fields
    tableFields.forEach((field) => {
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = field.name;
      input.classList.add("insert-field");
      input.dataset.fieldName = field.name; // Store field name as dataset for later retrieval
      form.appendChild(input);
    });

    const submitButton = document.createElement("button");
    submitButton.textContent = "Insert Record";
    submitButton.classList.add("insert-submit-btn");

    // Add event listener for form submission
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Gather values from the input fields
      const formData = {};
      form.querySelectorAll(".insert-field").forEach((input) => {
        formData[input.dataset.fieldName] = input.value;
      });

      try {
        await insertRecord(tableName, formData);
      } catch (error) {
        console.error("Error inserting record:", error);
        alert("Failed to insert record");
      }
    });

    form.appendChild(submitButton);
    formContainer.appendChild(form);

    // Show the form container
    // formContainer.style.display = "block";
    formContainer.classList.add("active");
    overlay.classList.add("active");
  }

  async function insertRecord(tableName, formData) {
    try {
      const response = await fetch(
        `http://localhost:3000/table/${tableName}/insert`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to insert record");
      }
      // If insertion is successful, reload table data
      fetchTableData(tableName);
    } catch (error) {
      console.error("Error inserting record:", error);
      alert("Failed to insert record");
    }
  }
  // Add event listener for closing the form

  // Get references to the close button and overlay
  const closeButton = document.querySelector(".close-form-btn");
  const overlay = document.querySelector(".overlay");
  const insertFormContainer = document.querySelector(".insert-form-container");
});
