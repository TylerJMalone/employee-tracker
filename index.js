const inquirer = require("inquirer");
// const { createPromptModule } = require('inquirer');
// const inquirer = createPromptModule();
// const fs = require("fs");
const connection = require("./db/connection");
require("console.table");

const mainMenu = () => {
    inquirer.prompt({
        type: "list",
        name: "mainMenu",
        message: "What would you like to do?",
        choices: [
            "View All Employees",
            "View All Employees By Department",
            "View All Employees By Manager",
            "Add Employee",
            "Remove Employee",
            "Update Employee Role",
            "Update Employee Manager",
            "View All Roles",
            "Add Role",
            "Remove Role",
            "View All Departments",
            "Add Department",
            "Remove Department",
            "View Total Utilized Budget By Department",
            "Exit"
        ]
    }).then((answer) => {
        switch (answer.mainMenu) {
            case "View All Employees":
                viewAllEmployees();
                break;
            case "View All Employees By Department":
                viewAllEmployeesByDepartment();
                break;
            case "View All Employees By Manager":
                viewAllEmployeesByManager();
                break;
            case "Add Employee":
                addEmployee();
                break;
            case "Remove Employee":
                removeEmployee();
                break;
            case "Update Employee Role":
                updateEmployeeRole();
                break;
            case "Update Employee Manager":
                updateEmployeeManager();
                break;
            case "View All Roles":
                viewAllRoles();
                break;
            case "Add Role":
                addRole();
                break;
            case "Remove Role":
                removeRole();
                break;
            case "View All Departments":
                viewAllDepartments();
                break;
            case "Add Department":
                addDepartment();
                break;
            case "Remove Department":
                removeDepartment();
                break;
            case "View Total Utilized Budget By Department":
                viewTotalUtilizedBudgetByDepartment();
                break;
            case "Exit":
                connection.end();
                break;
        }
    });
}

function viewAllEmployees() {
    const query = "SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name AS department, CONCAT(manager.first_name,'', manager.last_name) AS manager FROM employee LEFT JOIN role on employee.role_id = role.id LEFT JOIN department on role.department_id = department.id LEFT JOIN employee manager on employee.manager_id = manager.id";
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        mainMenu();
    });    
}

function viewAllEmployeesByDepartment() {
    inquirer.prompt({
        type: "list",
        name: "department",
        message: "Which department would you like to view?",
        choices: [
            "Sales",
            "Engineering",
            "Finance",
            "Legal"
        ]
    }).then((answer) => {
        switch (answer.department) {
            case "Sales":
                return viewAllEmployeesByDepartment("Sales");
            case "Engineering":
                return viewAllEmployeesByDepartment("Engineering");
            case "Finance":
                return viewAllEmployeesByDepartment("Finance");
            case "Legal":
                return viewAllEmployeesByDepartment("Legal");
        }
    });

    function viewAllEmployeesByDepartment(department) {
        const query = "SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name AS department, CONCAT(manager.first_name,'', manager.last_name) AS manager FROM employee LEFT JOIN role on employee.role_id = role.id LEFT JOIN department on role.department_id = department.id LEFT JOIN employee manager on employee.manager_id = manager.id WHERE department.name =?";
        connection.query(query, department, (err, res) => {
            if (err) throw err;
            console.table(res);
            mainMenu();
        });
    }
}

function viewAllEmployeesByManager() {
    const query = "SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name AS department, CONCAT(manager.first_name,'', manager.last_name) AS manager FROM employee LEFT JOIN role on employee.role_id = role.id LEFT JOIN department on role.department_id = department.id LEFT JOIN employee manager on employee.manager_id = manager.id ORDER BY manager";
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        mainMenu();
    });
}

function addEmployee() {
    let userInput;
    const query = `SELECT id, title FROM role WHERE title!= 'Manager'`;

    Promise.resolve()
    .then(() => {
        return new Promise((resolve, reject) => {
            connection.query(query, (err, res) => {
                if (err) throw err;
                resolve(res);
            });
        });
    })
    .then((rolesData) => {
        const roles = rolesData.map(
            (item) => `Role title: ${item.title}, Role ID: ${item.id}`
            );
        return inquirer.prompt([
            {
                name: "first_name",
                type: "input",
                message: "What is the employee's first name?"
            },
            {
                name: "last_name",
                type: "input",
                message: "What is the employee's last name?"
            },
            {
                type: "list",
                name: "role",
                message: "What is the employee's role?",
                choices: roles
            },
        ]);
    })
    .then((answer) => {
        userInput = answer;
        const query2 = `SELECT manager.id as manager_id,
        CONCAT(manager.first_name, ' ', manager.last_name) AS manager_name
        FROM employee
        LEFT JOIN role ON employee.role_id = role.id
        LEFT JOIN employee AS manager ON manager.id = employee.manager_id 
        WHERE manager.id IS NOT NULL
        GROUP BY manager_id;`;
        return new Promise((resolve, reject) => {
            connection.query(query2, (err, res) => {
                if (err) throw err;
                resolve(res);
            });
        });
    })
    .then((managersData) => {   
        const managers = managersData.map(
            (item) => `Manager name: ${item.manager_name}, Manager ID: ${item.manager_id}`
            );

            return inquirer.prompt([{
                type: "list",
                name: "manager",
                message: "Who is the employee's manager?",
                choices: managers
            },
        ]);
    })
    .then((answer) => {
        const query = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)`;
        connection.query(
            query,
            [
                userInput.first_name,
                userInput.last_name,
                userInput.role.split("ID: ")[1],
                answer.manager.split("ID: ")[1]
            ],
            (err, res) => {
                if (err) throw err;
                console.log("Employee added successfully!");
                viewAllEmployees();
            }
        );
    });
}

function removeEmployee() {
    const query = `SELECT 
    employee.id, 
    employee.first_name, 
    employee.last_name, 
    role.title, 
    department.name AS 
    department, 
    role.salary, 
    CONCAT(manager.first_name, ' ', manager.last_name) AS 
    manager FROM 
    employee LEFT JOIN role ON 
    employee.role_id = role.id 
    LEFT JOIN department ON 
    role.department_id = department.id LEFT JOIN 
    employee manager ON 
    manager.id = employee.manager_id;`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        const employees = res.map(
            (item) => `Employee ID: ${item.id}, Employee name: ${item.first_name} ${item.last_name}`
        );
        inquirer.prompt([
            {
                type: "list",
                name: "employee",
                message: "Which employee would you like to remove?",
                choices: employees
            }
        ]).then((answer) => {
            const query = `DELETE FROM employee WHERE id =?`;
            connection.query(query, answer.employee.split("ID: ")[1], (err, res) => {
                if (err) throw err;
                console.log("Employee removed successfully!");
                viewAllEmployees();
                }
            );
        });
    });
}

function updateEmployeeRole() {
    const query = `SELECT first_name, last_name FROM employee;`;
    connection.query(query, (err, res) => {
        const employees = res.map(
            (item) => `Employee ID: ${item.id}, Employee name: ${item.first_name} ${item.last_name}`
            );
            inquirer.prompt([
                {
                    type: "list",
                    name: "employee",
                    message: "Which employee's role would you like to update?",
                    choices: employees
                }
                ]).then((answer) => {
                    const query = `SELECT id, title FROM role WHERE title!= 'Manager';`;
                    connection.query(query, (err, res) => {
                        const roles = res.map(
                            (item) => `Role title: ${item.title}, Role ID: ${item.id}`
                            );
                            inquirer.prompt([
                                {
                                    type: "list",
                                    name: "role",
                                    message: "What is the employee's new role?",
                                    choices: roles
                                }
                                ]).then((answer) => {
                                    const query = `UPDATE employee SET role_id =? WHERE id =?`;
                                    connection.query(query, [answer.role.split("ID: ")[1], answer.employee.split("ID: ")[1]], (err, res) => {
                                        if (err) throw err;
                                        console.log("Employee role updated successfully!");
                                        viewAllEmployees();
                                        }
                                );
                        });
                });
            });
        });
};

function updateEmployeeManager() {
    const query = `SELECT first_name, last_name FROM employee;`;
    connection.query(query, (err, res) => {
        const employees = res.map(
            (item) => `Employee ID: ${item.id}, Employee name: ${item.first_name} ${item.last_name}`
            );
            inquirer.prompt([
                {
                    name: "employee",
                    type: "list",
                    message: "Which employee would you like to update?",
                    choices: employees,
                }
            ])
            .then((answer) => {
                const selectedEmployee = answer.employee.split (" ");
                const firstName = selectedEmployee[0];
                const lastName = selectedEmployee[1];

                const query = `SELECT 
                first_name, last_name 
                FROM employee 
                WHERE manager_id IS NULL 
                AND first_name != '${firstName}' 
                AND last_name != '${lastName}';`;
                connection.query(query, (err, res) => {
                    const managers = res.map(
                        (item) => `${item.first_name} ${item.last_name}`
                    );
                    inquirer.prompt({
                        name: "manager",
                        type: "list",
                        message: "who is the employees new manager?",
                        choices: "managers",
                    })
                .then((answer) => {
                    const query = `SELECT id FROM employee WHERE first_name = ? AND last_name = ?`;
            connection.query(query, [answer.manager.split(" ")[0], answer.manager.split(" ")[1]], (err, data) => {
              if (err) throw err;
              const managerId = data[0].id;

            const query = `UPDATE employee SET manager_id = ? WHERE first_name = ? AND last_name = ?`;
              connection.query(
                query,
                [managerId, firstName, lastName],
                (err, data) => {
                  if (err) throw err;
                  console.log(
                    `Successfully updated ${firstName} ${lastName}'s manager to ${answer.manager}.`
                  );
                  ViewAllEmployees();
                }
              );
            });
          });
      }
    );
  });

})
}

function viewAllRoles() {
    
}

return mainMenu();