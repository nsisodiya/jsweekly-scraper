const Sequelize = require("sequelize");
function connectDB() {
  return new Sequelize("database", "username", "password", {
    host: "localhost",
    dialect: "sqlite",
    operatorsAliases: false,
    pool: {
      max: 20,
      min: 0,
      acquire: 30000,
      idle: 10000
    },

    // SQLite only
    storage: "database.sqlite"
  });
}

const db = connectDB();

const Link = db.define("Link", {
  url: {
    type: Sequelize.STRING
  },
  origurl: {
    type: Sequelize.STRING
  },
  jsweeklyid: {
    type: Sequelize.STRING
  },
  domain: {
    type: Sequelize.STRING
  },
  author: {
    type: Sequelize.STRING
  },
  type: {
    type: Sequelize.STRING
  }
});
module.exports = db;
