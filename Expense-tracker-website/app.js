const express = require("express");
const body_parser = require("body-parser");
var cors = require("cors");
const path = require("path");
const sequelize = require("./util/database");
const User = require("./models/user");
const Expense = require("./models/expenses");

const userRoutes = require("./routes/user");
const expenseRoutes = require("./routes/expense");

const app = express();
const dotenv = require("dotenv");

//get config vars
dotenv.config();

app.use(cors());

// Middleware
app.use(body_parser.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/user", userRoutes);
app.use("/expense", expenseRoutes);

User.hasMany(Expense);
Expense.belongsTo(User);

sequelize
  .sync()
  .then(() => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
