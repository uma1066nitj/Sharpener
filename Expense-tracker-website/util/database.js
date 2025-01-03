const Sequelize = require("sequelize");
const dotenv = require("dotenv");
//get config vars
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    dialect: "mysql",
    host: process.env.HOST_NAME,
  }
);

module.exports = sequelize;
