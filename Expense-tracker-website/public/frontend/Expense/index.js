const URLTOBACKEND = "http://localhost:3000/";
const tableBody = document.querySelector(".table");

const token = localStorage.getItem("token");

function addNewExpense(e) {
  e.preventDefault();
  const form = new FormData(e.target);

  const expenseDetails = {
    expenseamount: form.get("expenseamount"),
    description: form.get("description"),
    category: form.get("category"),
  };
  console.log(expenseDetails);
  axios
    .post(`${URLTOBACKEND}user/addexpense`, expenseDetails, {
      headers: { Authorization: token },
    })
    .then((response) => {
      if (response.status === 201) {
        addNewExpensetoUI(response.data.expense);
      } else {
        throw new Error("Failed To create new expense");
      }
    })
    .catch((err) => showError(err));
}

function addNewExpensetoUI(element) {
  tableBody.innerHTML += `
        <tr id="expense-${element.id}">
        <td class="amount">${element.expenseamount}</td>
        <td class="description">${element.description}</td>
        <td class="category">${element.category}</td>
        <td><button style="cursor: pointer;background-color: red;border: none;" onclick='deleteExpense(event, ${element.id})'>Delete</button></td>
        </tr>`;
}
function deleteExpense(e, expenseid) {
  e.preventDefault();
  axios
    .delete(`${URLTOBACKEND}user/deleteexpense?id=${expenseid}`, {
      headers: { Authorization: token },
    })
    .then((response) => {
      if (response.status === 204) {
        removeExpensefromUI(expenseid);
      } else {
        throw new Error("Failed to delete");
      }
    })
    .catch((err) => {
      showError(err);
    });
}

function showError(err) {
  document.body.innerHTML += `<div style="color:red;"> ${err}</div>`;
}

function removeExpensefromUI(expenseid) {
  const expenseElemId = `expense-${expenseid}`;
  document.getElementById(expenseElemId).remove();
}
