async function fetchExpenses() {
  const token = localStorage.getItem("token");
  console.log("Fetching expenses with token:", token);

  try {
    const response = await axios.get("http://localhost:3000/get-expenses", {
      headers: { Authorization: `Bearer ${token}` },
    });
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
  } catch (error) {
    console.error("Error fetching expenses:", error);
  }
}

async function deleteExpense(expenseId) {
  const token = localStorage.getItem("token");
  console.log("Deleting expense with token:", token);

  try {
    const response = await axios.delete(
      `http://localhost:3000/delete-expense/${expenseId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    alert(response.data.message);
    fetchExpenses(); // Refresh expenses after deletion
  } catch (error) {
    console.error("Error deleting expense:", error);
    alert("Error deleting expense");
  }
}

async function addExpense(event) {
  event.preventDefault();
  const token = localStorage.getItem("token");
  console.log("Adding expense with token:", token);

  const amount = document.querySelector('input[name="amount"]').value;
  const description = document.querySelector('input[name="description"]').value;
  const category = document.querySelector('select[name="category"]').value;

  try {
    const response = await axios.post(
      "http://localhost:3000/add-expense",
      {
        amount: amount,
        description: description,
        category: category,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    alert(response.data.message);
    document.querySelector('input[name="amount"]').value = "";
    document.querySelector('input[name="description"]').value = "";
    document.querySelector('select[name="category"]').value = "Food";

    fetchExpenses();
  } catch (error) {
    console.error("There was an error!", error);
    alert("Error adding expense");
  }
}

async function buyPremium() {
  const token = localStorage.getItem("token");

  try {
    const response = await axios.post(
      "http://localhost:3000/create-order",
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const orderData = response.data;

    const options = {
      key: process.env.RAZORPAY_KEY_ID, // Enter the Key ID generated from the Razorpay Dashboard
      amount: orderData.amount,
      currency: "INR",
      name: "Expense Tracker",
      description: "Premium Membership",
      order_id: orderData.id,
      handler: async function (response) {
        try {
          await axios.post(
            "http://localhost:3000/verify-order",
            {
              order_id: orderData.id,
              payment_id: response.razorpay_payment_id,
              status: "SUCCESS",
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          alert("Transaction successful");
          window.location.reload();
        } catch (err) {
          alert("Transaction verification failed");
        }
      },
      prefill: {
        name: "John Doe",
        email: "john.doe@example.com",
        contact: "9999999999",
      },
      theme: {
        color: "#F37254",
      },
    };

    const rzp1 = new Razorpay(options);
    rzp1.on("payment.failed", async function (response) {
      try {
        await axios.post(
          "http://localhost:3000/failed-order",
          {
            order_id: orderData.id,
            payment_id: response.error.metadata.payment_id,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        alert("Transaction failed");
      } catch (err) {
        alert("Failed to update transaction status");
      }
    });

    rzp1.open();
  } catch (error) {
    console.error("Error creating order:", error);
  }
}

async function checkPremiumStatus() {
  const token = localStorage.getItem("token");

  try {
    const response = await axios.get(
      "http://localhost:3000/check-premium-status",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const isPremium = response.data.isPremium;
    const premiumMessage = document.getElementById("premiumMessage");

    if (isPremium) {
      document.getElementById("premiumMessage").style.display = "block";
      document.querySelector(".premium-button").style.display = "none";
      document.getElementById("premiumMessage").innerText =
        "👑 You are a Premium Member!";
      document.getElementById("leaderboardButton").style.display = "block";
    } else {
      premiumMessage.textContent = "";
    }
  } catch (error) {
    console.error("Error checking premium status:", error);
  }
}

async function fetchLeaderboard() {
  const token = localStorage.getItem("token");

  try {
    const response = await axios.get("http://localhost:3000/leaderboard", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const leaderboardList = document.getElementById("leaderboard-list");
    leaderboardList.innerHTML = ""; // Clear previous list items

    response.data.forEach((user) => {
      const listItem = document.createElement("li");
      listItem.textContent = `Name: ${user.name} - Total Expense: ${user.total_expense}`;
      leaderboardList.appendChild(listItem);
    });
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
  }
}

window.onload = () => {
  fetchExpenses();
  checkPremiumStatus();
};
