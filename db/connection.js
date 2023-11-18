
const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "employee_db"
},
    console.log(`Connected to the employee db.`)
);


module.exports = db;