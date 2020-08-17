DROP TABLE IF EXISTS employee;
DROP TABLE IF EXISTS role;
DROP TABLE IF EXISTS department;
CREATE TABLE department(
  id INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(30) NOT NULL
);
CREATE TABLE role(
  id INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(30) NOT NULL,
  salary DECIMAL(9, 2) NOT NULL DEFAULT 15080.00,
  department_id INTEGER UNSIGNED,
  CONSTRAINT fk_department FOREIGN KEY (department_id) REFERENCES department(id) ON DELETE CASCADE,
  CONSTRAINT chk_min_wage_salary CHECK (salary >= 15080.00)
);
CREATE TABLE employee(
  id INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  role_id INTEGER UNSIGNED,
  manager_id INTEGER UNSIGNED,
  CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE
  SET NULL,
    CONSTRAINT fk_manager FOREIGN KEY (manager_id) REFERENCES employee(id) ON DELETE
  SET NULL
);