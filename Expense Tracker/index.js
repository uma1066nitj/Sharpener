const myForm = document.querySelector("#my-form");
const moneyInput = document.querySelector("#money");
const serviceInput = document.querySelector("#service");
const serviceCategoryInput = document.querySelector("#service-category");
const expenseList = document.querySelector("#expense-list");

myForm.addEventListener("submit", onSubmit);

let expenses = [];

function onSubmit(e) {
  e.preventDefault();
  if (moneyInput.value.trim() === "" || serviceInput.value.trim() === "") {
    alert("Please Complete all the fields");
  } else {
    const li = document.createElement("li");
    const deleteBtn = document.createElement("button");
    const editBtn = document.createElement("button");

    deleteBtn.classList.add("delete", "btn", "btn-danger");
    deleteBtn.appendChild(document.createTextNode("Delete"));

    editBtn.classList.add("edit", "btn", "btn-secondary");
    editBtn.appendChild(document.createTextNode("Edit"));

    li.classList.add("list-group-item");
    let listItemText = `I spent ${moneyInput.value} rupees on a ${serviceInput.value} which falls under the ${serviceCategoryInput.value} category.`;
    li.appendChild(document.createTextNode(listItemText));

    const storageKey = `expense_${expenses.length}`;
    const expense = {
      money: moneyInput.value,
      service: serviceInput.value,
      serviceCategory: serviceCategoryInput.value,
      listItemText,
      storageKey,
    };
    expenses.push(expense);

    deleteBtn.addEventListener("click", () => removeItem(expense, li));
    editBtn.addEventListener("click", () => editItem(expense, li));

    li.appendChild(deleteBtn);
    li.appendChild(editBtn);
    expenseList.appendChild(li);

    localStorage.setItem(storageKey, JSON.stringify(expense));
  }

  moneyInput.value = "";
  serviceInput.value = "";
  serviceCategoryInput.selectedIndex = 0;

  //Delete Button function and edit button function
  function removeItem(expense, listItem) {
    const index = expenses.indexOf(expense);
    if (index != -1) {
      expenses.splice(index, 1);
    }
    expenseList.removeChild(listItem);
    localStorage.removeItem(expense.storageKey);
  }

  function editItem(expense, listItem) {
    expenseList.removeChild(listItem);
    localStorage.removeItem(expense.storageKey);
    moneyInput.value = expense.money;
    serviceInput.value = expense.service;
    serviceCategoryInput = expense.serviceCategory;
  }
}
