const Sequelize = require("sequelize");

const sequelize = new Sequelize("practice", "root", "root", {
  dialect: "mysql",
  host: "localhost",
});

module.exports = sequelize;
