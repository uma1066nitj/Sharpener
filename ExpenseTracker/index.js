const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const UserController = require("./Controller/userController");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.post("/api/expenses", UserController.addExpense);
app.delete("/api/expenses/:userId", UserController.deleteExpense);
app.get("/api/expenses", UserController.getExpense);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
