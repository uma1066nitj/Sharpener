const myForm = document.querySelector("#my-form");
const moneyInput = document.querySelector("#money");
const serviceInput = document.querySelector("#service");
const serviceCategoryInput = document.querySelector("#service-category");
const expenseList = document.querySelector("#expense-list");
const axios = require("axios");

myForm.addEventListener("submit", onSubmit);
window.addEventListener("DOMContentLoaded", () => {
  showExpensesFromServer();
});

function onSubmit(e) {
  e.preventDefault();
  if (moneyInput.value.trim() === "" || serviceInput.value.trim() === "") {
    alert("Please Complete all the fields");
  } else {
    const expense = {
      money: moneyInput.value,
      service: serviceInput.value,
      serviceCategory: serviceCategoryInput.value,
    };

    const li = createMoneyElement(expense);
    expenseList.append(li);

    addExpenseToServer(expense);
    moneyInput.value = "";
    serviceInput.value = "";
    serviceCategoryInput.selectedIndex = 0;
  }
  function createMoneyElement(user) {
    const li = document.createElement("li");
    const deleteBtn = createButton("Delete", "delete");
    const editBtn = createButton("Edit", "edit");

    li.appendChild(
      document.createTextNode(
        `Money: ${expense.money}, Service: ${expense.service}, ServiceCatgory: ${expense.serviceCategory}`
      )
    );

    li.appendChild(deleteBtn);
    li.appendChild(editBtn);

    deleteBtn.addEventListener("click", () => removeItem(expense.id));
    editBtn.addEventListener("click", () => editItem(expense.id));

    return li;
  }
  function createButton(text, className) {
    const btn = document.createElement("button");
    btn.className = className;
    btn.appendChild(document.createTextNode(text));
    return btn;
  }
  function displayMessage(message, className) {
    msg.classList.add(className);
    msg.textContent = message;

    setTimeout(() => {
      msg.classList.remove(className);
      msg.textContent = "";
    }, 3000);
  }

  function addExpenseToServer(expense) {
    axios
      .post("http://localhost:3000/api/expenses")
      .then(() => {
        showExpensesFromServer();
      })
      .catch((err) => console.log(err));
  }

  async function showExpensesFromServer() {
    expenseList.innerHTML = "";
    axios
      .get("http://localhost:3000/api/expenses")
      .then((res) => {
        const users = res.data;
        users.forEach((user) => {
          const li = createUserElement(user);
          userList.appendChild(li);
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }
  //Delete Button function and edit button function
  function removeItem(userId) {
    axios
      .delete(`http://localhost:3000/api/expenses/${userId}`)
      .then(() => {
        showUsersFromServer();
      })
      .catch((err) => console.log(err));
  }

  function editItem(userId) {
    axios
      .get(`http://localhost:3000/api/expenses/${userId}`)
      .then((response) => {
        const expense = response.data;
        moneyInput.value = expense.money;
        serviceInput.value = expense.service;
        serviceCategoryInput.value = expense.serviceCategory;

        myForm.removeEventListener("submit", onSubmit);

        myForm.addEventListener("submit", (e) => {
          if (
            moneyInput.value.trim() === "" ||
            serviceInput.value.trim() === ""
          ) {
            alert("Please complete all the required fields");
          } else {
            const updatedExpenses = {
              id: userId,
              money: moneyInput.value,
              service: serviceInput.value,
              serviceCategory: serviceCategoryInput.value,
            };

            axios
              .post(
                `http://localhost:3000/api/expenses/${userId}`,
                updatedExpenses
              )
              .then(() => {
                showExpensesFromServer();
              })
              .catch((err) => {
                console.log(err);
              });

            moneyInput.value = "";
            serviceInput.value = "";
            serviceCategoryInput.selectedIndex = 0;

            myForm.removeEventListener("submit", onSubmit);
            myForm.addEventListener("submit", onsubmit);
          }
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }
}
