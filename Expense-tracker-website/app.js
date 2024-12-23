const express = require("express");
const body_parser = require("body-parser");
var cors = require("cors");
const sequelize = require("./util/database");
// const User = require("./models/user");

const userRoutes = require("./routes/user");

const app = express();
const dotenv = require("dotenv");

//get config vars
dotenv.config();

app.use(cors());

// Middleware
app.use(body_parser.json());

app.use("/user", userRoutes);

sequelize
  .sync()
  .then(() => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
