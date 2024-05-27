document.addEventListener("DOMContentLoaded", async function () {
  const createNewTableBtn = document.getElementById("createNewTableBtn");
  const createForm = document.getElementById("createForm");
  const closeFormBtn = document.getElementById("closeFormBtn");
  const addFieldBtn = document.getElementById("addFieldBtn");
  const createTableBtn = document.getElementById("createTable");
  const fieldsContainer = document.getElementById("fields");
  const tableList = document.getElementById("tableList");
  const tableContainer = document.getElementById("tableContainer");

  createNewTableBtn.addEventListener("click", () => {
    createForm.style.display = "flex";
  });

  closeFormBtn.addEventListener("click", () => {
    createForm.style.display = "none";
  });

  addFieldBtn.addEventListener("click", () => {
    const field = document.createElement("div");
    field.className = "field";
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
    fieldsContainer.appendChild(field);
  });

  createTableBtn.addEventListener("click", async () => {
    const tableName = document.getElementById("tableName").value;
    const fields = Array.from(
      fieldsContainer.getElementsByClassName("field")
    ).map((field) => {
      return {
        name: field.querySelector(".fieldName").value,
        type: field.querySelector(".fieldType").value,
      };
    });

    try {
      const response = await fetch("http://localhost:5000/create-table", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tableName, fields }),
      });
      const data = await response.json();
      // alert(data.message);
      createForm.style.display = "none";
      loadTables();
    } catch (error) {
      console.error("Error:", error);
    }
  });

  async function loadTables() {
    try {
      const response = await fetch("http://localhost:5000/tables");
      if (!response.ok) {
        throw new Error("Failed to fetch tables.");
      }

      const tables = await response.json();
      tableList.innerHTML = "";
      tables.forEach((table) => {
        const tableBtn = document.createElement("div");
        tableBtn.classList.add("table-btn-container");
        tableBtn.innerHTML = `
          <button class="table-btn">${table}</button>
        `;

        tableBtn.querySelector(".table-btn").addEventListener("click", () => {
          loadTableData(table);
        });

        tableList.appendChild(tableBtn);
      });
    } catch (error) {
      console.error("Error fetching tables:", error);
      tableList.innerHTML = "<p>Error fetching tables data.</p>";
    }
  }

  async function loadTableData(tableName) {
    try {
      const dataResponse = await fetch(
        `http://localhost:5000/table/${tableName}`
      );
      const data = await dataResponse.json();

      const columnsResponse = await fetch(
        `http://localhost:5000/table-columns/${tableName}`
      );
      const columns = await columnsResponse.json();

      if (!columns || columns.length === 0) {
        console.error("Columns data is missing or empty.");
        return;
      }
      tableContainer.innerHTML = `<h3>${tableName}</h3>`;

      const insertDataBtn = document.createElement("button");
      insertDataBtn.className = "insert-data-btn";
      insertDataBtn.textContent = "Insert Data";
      tableContainer.addEventListener("click", function (event) {
        if (
          event.target &&
          event.target.classList.contains("insert-data-btn")
        ) {
          showInsertForm(tableName, columns);
        }
      });

      tableContainer.appendChild(insertDataBtn);

      if (data.length === 0) {
        // Display headers even when no data is available
        const table = document.createElement("table");
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");

        columns.forEach((header) => {
          const th = document.createElement("th");
          th.textContent = header;
          headerRow.appendChild(th);
        });

        const actionsHeader = document.createElement("th");
        actionsHeader.textContent = "Actions";
        headerRow.appendChild(actionsHeader);

        thead.appendChild(headerRow);
        table.appendChild(thead);
        tableContainer.appendChild(table);
        tableContainer.innerHTML += "<p>No data available</p>";
        return;
      }

      const table = document.createElement("table");
      const thead = document.createElement("thead");
      const tbody = document.createElement("tbody");

      const headers = Object.keys(data[0]);
      const headerRow = document.createElement("tr");

      headers.forEach((header) => {
        const th = document.createElement("th");
        th.textContent = header;
        headerRow.appendChild(th);
      });

      const deleteHeader = document.createElement("th");
      deleteHeader.textContent = "Actions";
      headerRow.appendChild(deleteHeader);

      thead.appendChild(headerRow);
      table.appendChild(thead);

      data.forEach((row) => {
        const tr = document.createElement("tr");
        headers.forEach((header) => {
          const td = document.createElement("td");
          td.textContent = row[header];
          tr.appendChild(td);
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", async () => {
          try {
            await fetch(
              `http://localhost:5000/delete-data/${tableName}/${row.id}`,
              {
                method: "DELETE",
              }
            );
            loadTableData(tableName);
          } catch (error) {
            console.error("Error deleting data:", error);
          }
        });

        const deleteTd = document.createElement("td");
        deleteTd.appendChild(deleteButton);
        tr.appendChild(deleteTd);

        tbody.appendChild(tr);
      });

      table.appendChild(tbody);
      tableContainer.appendChild(table);
    } catch (error) {
      console.error(`Error fetching data from table ${tableName}:`, error);
    }
  }

  async function showInsertForm(tableName, columns) {
    try {
      const insertForm = document.createElement("div");
      insertForm.className = "insert-form";
      insertForm.innerHTML = `<h3>Insert Data into ${tableName}</h3>`;

      columns.forEach((column) => {
        const field = document.createElement("div");
        field.className = "field";
        field.innerHTML = `
          <label>${column}</label>
          <input type="text" name="${column}" />
        `;
        insertForm.appendChild(field);
      });

      const submitBtn = document.createElement("button");
      submitBtn.textContent = "Submit";
      submitBtn.addEventListener("click", async () => {
        const formData = {};
        insertForm.querySelectorAll(".field input").forEach((input) => {
          formData[input.name] = input.value;
        });

        try {
          await fetch(`http://localhost:5000/insert-data/${tableName}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          });
          loadTableData(tableName);
          insertForm.remove();
        } catch (error) {
          console.error("Error inserting data:", error);
        }
      });

      insertForm.appendChild(submitBtn);
      tableContainer.appendChild(insertForm);
    } catch (error) {
      console.error(`Error fetching columns for table ${tableName}:`, error);
    }
  }

  loadTables();
});
