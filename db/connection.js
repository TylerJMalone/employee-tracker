const mysql = require("mysql");

const db = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "employee_db"
},
    console.log(`Connected to the employee db.`)
);

module.exports = db;