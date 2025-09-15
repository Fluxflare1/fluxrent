const sequelize = require("../sequelize");
const User = require("./user");

async function initModels() {
  await sequelize.sync({ alter: true });
}

module.exports = { sequelize, User, initModels };
