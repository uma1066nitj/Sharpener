const URLTOBACKEND = "http://localhost:3000/";
const tableBody = document.querySelector(".table tbody");
const EMAILID = "ceoumashankar@gmail.com";
const PHONENO = "7257868848";

const token = localStorage.getItem("token");

// Add new expense
function addNewExpense(e) {
  e.preventDefault();
  const form = e.target;

  const expenseDetails = {
    expenseamount: form.expenseamount.value,
    description: form.description.value,
    category: form.category.value,
  };

  axios
    .post(`${URLTOBACKEND}expense/addexpense`, expenseDetails, {
      headers: { Authorization: token },
    })
    .then((response) => {
      if (response.status === 201) {
        addNewExpensetoUI(response.data.expense);
        form.reset();
      } else {
        throw new Error("Failed To create new expense");
      }
    })
    .catch((err) => showError(err));
}

// Add expense to UI
function addNewExpensetoUI(element) {
  tableBody.innerHTML += `
    <tr id="expense-${element.id}">
      <td class="amount">${element.expenseamount}</td>
      <td class="description">${element.description}</td>
      <td class="category">${element.category}</td>
      <td>
        <button style="cursor: pointer; background-color: red; border: none;" onclick="deleteExpense(event, ${element.id})">
          Delete
        </button>
      </td>
    </tr>`;
}

// Delete expense
function deleteExpense(e, expenseid) {
  e.preventDefault();

  axios
    .delete(`${URLTOBACKEND}expense/deleteexpense?id=${expenseid}`, {
      headers: { Authorization: token },
    })
    .then((response) => {
      if (response.status === 204) {
        removeExpensefromUI(expenseid);
      } else {
        throw new Error("Failed to delete expense");
      }
    })
    .catch((err) => showError(err));
}

// Remove expense from UI
function removeExpensefromUI(expenseid) {
  const expenseElemId = `expense-${expenseid}`;
  document.getElementById(expenseElemId).remove();
}

// Enable dark mode
function enableDarkMode() {
  document.body.classList.add("dark-mode");
  document.getElementById("rzp-button1").textContent = "You're Premium User";
  document.getElementById("rzp-button1").disabled = true;
  document.getElementById("leaderboard-button").style.display = "block";
}

document.getElementById("leaderboard-button").onclick = function () {
  axios
    .get(`${URLTOBACKEND}premium/showLeaderBoard`, {
      headers: { Authorization: token },
    })
    .then((response) => {
      if (response.status === 200) {
        const leaderboardList = document.getElementById("leaderboard-list");
        leaderboardList.innerHTML = ""; // Clear any previous data
        const leaderboardData = response.data;

        leaderboardData.forEach((user, index) => {
          const row = document.createElement("tr");
          // Add medals for top 3 users
          let medal = "";
          if (index === 0) {
            medal = "🥇"; // Gold Medal
          } else if (index === 1) {
            medal = "🥈"; // Silver Medal
          } else if (index === 2) {
            medal = "🥉"; // Bronze Medal
          }
          row.innerHTML = `
            <td>${index + 1}</td>
            <td>${user.name}${medal}</td>
            <td>${user.totalExpenses}</td>
          `;
          leaderboardList.appendChild(row);
        });

        document.getElementById("leaderboard").style.display = "block";
      } else {
        throw new Error("Failed to fetch leaderboard");
      }
    })
    .catch((err) => {
      console.error("Error fetching leaderboard:", err);
      alert("Unable to fetch leaderboard data.");
    });
};

// Fetch expenses
function fetchExpenses() {
  axios
    .get(`${URLTOBACKEND}expense/getexpense`, {
      headers: { Authorization: token },
    })
    .then((response) => {
      if (response.status === 200) {
        response.data.expense.forEach((expense) => {
          addNewExpensetoUI(expense);
        });
      } else {
        throw new Error("Failed to fetch expenses");
      }
    })
    .catch((err) => showError(err));
}

// Buy premium membership
document.getElementById("rzp-button1").onclick = async function (e) {
  e.preventDefault();

  const response = await axios.get(
    `${URLTOBACKEND}purchase/premiummembership`,
    { headers: { Authorization: token } }
  );

  const options = {
    key: response.data.key_id,
    amount: response.data.order.amount,
    name: "Uma Shankar",
    description: "Premium Membership",
    order_id: response.data.order.id,
    prefill: {
      name: "Uma Shankar",
      email: EMAILID,
      contact: PHONENO,
    },
    theme: {
      color: "#3399cc",
    },
    handler: function (response) {
      axios
        .post(
          `${URLTOBACKEND}purchase/updatetransactionstatus`,
          {
            orderid: options.order_id,
            paymentid: response.razorpay_payment_id,
          },
          { headers: { Authorization: token } }
        )
        .then(() => {
          alert("You are a Premium User Now");
          localStorage.setItem(
            "userDetails",
            JSON.stringify({ ispremiumuser: true })
          );
          enableDarkMode();
        })
        .catch(() => {
          alert("Something went wrong. Try Again!!!");
        });
    },
  };

  const rzp1 = new Razorpay(options);
  rzp1.open();

  rzp1.on("payment.failed", function (response) {
    alert("Payment Failed");
    console.error(response.error);
  });
};

// Show error
function showError(err) {
  document.body.innerHTML += `<div style="color:red;"> ${err}</div>`;
}

// Check premium status on page load
window.addEventListener("DOMContentLoaded", () => {
  const userDetails = JSON.parse(localStorage.getItem("userDetails"));
  if (userDetails?.ispremiumuser) {
    enableDarkMode();
  }
  fetchExpenses();
});

//Pagination Start
const prev = document.getElementById("prevPage");
const curr = document.getElementById("currPage");
const next = document.getElementById("nextPage");

let totalpages;
let ITEM_PER_PAGE = 10;
let prevPageNumber;
let currPageNumber;
let nextPageNumber;

prev.addEventListener("click", () => {
  console.log("Back Button Clicked");
  currPageNumber = parseInt(curr.innerHTML);

  if (currPageNumber !== 1) {
    currPageNumber--;
    curr.innerHTML = currPageNumber;
    getExpenses(currPageNumber, ITEM_PER_PAGE);
  }
});

next.addEventListener("click", () => {
  console.log("Next Button Clicked");
  currPageNumber = parseInt(curr.innerHTML);

  ITEM_PER_PAGE = document.getElementById("setlimit").value;

  if (currPageNumber < totalpages) {
    currPageNumber++;
    curr.innerHTML = currPageNumber;
    getExpenses(currPageNumber, ITEM_PER_PAGE);
  }
});

//Pagination End
function addExpensetoUI(element) {
  tableBody.innerHTML += `
      <tr id="expense-${element.id}">
      <td class="amount">${element.expenseamount}</td>
      <td class="description">${element.description}</td>
      <td class="category">${element.category}</td>
      <td><button style="cursor: pointer;background-color: red;border: none;" onclick='deleteExpense(event, ${element.id})'>Delete</button></td>
      </tr>`;
}

function getExpenses(page = 1, limit = 10) {
  tableBody.innerHTML = ` <tr>
        <th>Amount</th>
        <th>Description</th>
        <th>Category</th>
        <th>Delete</th>
        </tr>`;

  axios
    .get(`${URLTOBACKEND}user/getexpense?page=${page}&limit=${limit}`, {
      headers: { Authorization: token },
    })
    .then((response) => {
      if (response.status == 200) {
        response.data.expense.results.forEach((expense) => {
          totalpages = expense.lastPage;
          addExpensetoUI(expense);
        });
      } else {
        throw new Error();
      }
    });
}
