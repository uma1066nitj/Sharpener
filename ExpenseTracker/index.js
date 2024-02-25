const express = require("express");
const bodyParser = require("body-parser");
const UserController = require("./controller/userController");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.post("/api/expenses", UserController.addExpense);
app.delete("/api/expenses/:userId", UserController.deleteExpense);
app.get("/api/expenses", UserController.getExpense);
app.edit("/api/expenses/:userId", UserController.editExpense);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
