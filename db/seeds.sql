INSERT INTO department (name)
VALUES  ('Sales'), 
        ('Engineering'), 
        ('Finance'),
        ('Legal');


INSERT INTO role (title, salary, department_id) 
VALUES  ('Sales Manager', 100000, 1),
        ('Sales Analyst', 55000, 1),
        ('Financial Manager', 120000, 2),
        ('Accountant', 70000, 2),
        ('Assistant Manager', 150000, 3),
        ('Software Engineer', 80000, 3),
        ('Manager', 110000, 4),
        ('Morale Officer', 50000, 4),
        ('Team Mascot', 130000, 1);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES  ('James', 'Brown', 1, NULL),
        ('Arnold', 'Hampton', 2, 1),
        ('Dick', 'Grayson', 3, NULL),
        ('Micheal', 'Peels', 4, 3),
        ('Dwight', 'Howard', 5, NULL),
        ('Derrick', 'Frazier', 6, 5),
        ('Brooke', 'Smith', 7, NULL),
        ('Amanda', 'McDonald', 8, 7),
        ('Skip', 'Johnson', 9, NULL);