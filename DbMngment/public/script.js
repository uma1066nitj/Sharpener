document.addEventListener("DOMContentLoaded", () => {
  const createNewTableBtn = document.getElementById("createNewTableBtn");
  const createForm = document.getElementById("createForm");
  const addFieldBtn = document.getElementById("addFieldBtn");
  const createTableBtn = document.getElementById("createTable");
  const tableList = document.getElementById("tableList");

  createNewTableBtn.addEventListener("click", () => {
    createForm.style.display = "block";
  });

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
    for (let field of fields) {
      const fieldName = field.querySelector(".fieldName").value.trim();
      const fieldType = field.querySelector(".fieldType").value.trim();

      if (fieldName === "" || fieldType === "Select type") {
        alert("Please complete all the fields for each added field");
        return;
      }

      fieldList.push(`${fieldName} ${fieldType}`);
    }

    const formData = {
      tableName: tableName,
      fields: fieldList.join(", "),
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
        alert("Table created successfully");

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

  // Function to fetch and display table data
  function fetchTableData(tableName) {
    fetch(`http://localhost:3000/${tableName}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data); // Display fetched table data
        // Render the table data on the UI as needed
      })
      .catch((error) => {
        console.error("There was a problem with the request:", error);
        alert(`Failed to fetch data for table: ${tableName}`);
      });
  }
});
