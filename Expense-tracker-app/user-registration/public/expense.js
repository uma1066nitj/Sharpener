function fetchExpenses() {
  const token = localStorage.getItem("token");
  console.log("Fetching expenses with token:", token);

  axios
    .get("http://localhost:3000/get-expenses", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((response) => {
      const expensesList = document.getElementById("expenses");
      expensesList.innerHTML = ""; // Clear previous list items

      response.data.forEach((expense) => {
        const listItem = document.createElement("li");
        listItem.textContent = `Amount: ${expense.amount} - Description: ${expense.description} - Category: ${expense.category}`;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.onclick = () => deleteExpense(expense.id); // Call deleteExpense function with expense ID
        listItem.appendChild(deleteButton);

        expensesList.appendChild(listItem);
      });
    })
    .catch((error) => {
      console.error("Error fetching expenses:", error);
    });
}
function deleteExpense(expenseId) {
  const token = localStorage.getItem("token");
  console.log("Deleting expense with token:", token);

  axios
    .delete(`http://localhost:3000/delete-expense/${expenseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((response) => {
      alert(response.data.message);
      fetchExpenses(); // Refresh expenses after deletion
    })
    .catch((error) => {
      console.error("Error deleting expense:", error);
      alert("Error deleting expense");
    });
}

function addExpense(event) {
  event.preventDefault();
  const token = localStorage.getItem("token");
  console.log("Adding expense with token:", token);

  const amount = document.querySelector('input[name="amount"]').value;
  const description = document.querySelector('input[name="description"]').value;
  const category = document.querySelector('select[name="category"]').value;

  axios
    .post(
      "http://localhost:3000/add-expense",
      {
        amount: amount,
        description: description,
        category: category,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    .then((response) => {
      alert(response.data.message);
      document.querySelector('input[name="amount"]').value = "";
      document.querySelector('input[name="description"]').value = "";
      document.querySelector('select[name="category"]').value = "Food";

      fetchExpenses();
    })
    .catch((error) => {
      console.error("There was an error!", error);
      alert("Error adding expense");
    });
}

window.onload = fetchExpenses;
