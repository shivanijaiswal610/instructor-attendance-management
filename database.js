const mysql = require("mysql");
require("dotenv/config");

var mysqlConnection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

mysqlConnection.connect((err) => {
  !err
    ? console.log("Connected to DB")
    : console.log("Database error", err);
});

module.exports = mysqlConnection;
