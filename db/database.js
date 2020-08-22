const sql = require('sql-template-strings');
const mysql = require('mysql2/promise');
// eslint-disable-next-line node/no-unpublished-require
const CONNECTION_SETTINGS = require('./connection.json');
const SELECT = Object.freeze({
  department: () => sql`SELECT * FROM department`,
  role: () => sql`SELECT role.id AS id,
      department.name AS department,
      title,
      salary
    FROM role
      LEFT JOIN department ON department_id = department.id`,
  employee: () => sql`SELECT emp.id AS id,
      emp.first_name,
      emp.last_name,
      department.name AS department,
      role.title AS title,
      role.salary AS salary,
      CONCAT (mgr.first_name, ' ', mgr.last_name) AS manager
    FROM employee emp
      LEFT JOIN role ON emp.role_id = role.id
      LEFT JOIN department ON role.department_id = department.id
      LEFT JOIN employee mgr ON emp.manager_id = mgr.id`,
});
const WHERE = Object.freeze({
  department: {
    id: (id) => sql` WHERE id = ${id}`,
    name: (name) => sql` WHERE name LIKE CONCAT('%',${name},'%')`,
  },
  role: {
    id: (id) => sql` WHERE role.id = ${id}`,
    title: (title) => sql` WHERE title LIKE CONCAT('%',${title},'%')`,
    fuzzy: (text) => sql` WHERE title LIKE CONCAT('%',${text},'%') OR department.name LIKE CONCAT('%',${text},'%')`,
  },
  employee: {
    id: (id) => sql` WHERE emp.id = ${id}`,
    departmentId: (departmentId) => sql` WHERE role.department_id = ${departmentId}`,
    isManager: () => ' WHERE emp.id in (SELECT manager_id FROM employee)',
    managerId: (managerId) => sql` WHERE emp.manager_id = ${managerId}`,
    name: (name) =>
      sql` WHERE emp.first_name LIKE CONCAT('%',${name},'%') OR emp.last_name LIKE CONCAT('%',${name},'%')`,
  },
});
const ORDER = Object.freeze({
  department: {
    name: (desc = false) => ` ORDER BY name ${desc ? 'DESC' : ''}`,
    id: (desc = false) => ` ORDER BY id ${desc ? 'DESC' : ''}`,
  },
  role: {
    deptFirst: (desc = false) => ` ORDER BY department.name ${desc ? 'DESC' : ''}, title ${desc ? 'DESC' : ''}`,
    title: (desc = false) => ` ORDER BY title ${desc ? 'DESC' : ''}`,
  },
  employee: {
    lastName: (desc = false) => ` ORDER BY emp.last_name ${desc ? 'DESC' : ''}, emp.first_name ${desc ? 'DESC' : ''}`,
    firstName: (desc = false) => ` ORDER BY emp.first_name ${desc ? 'DESC' : ''}, emp.last_name ${desc ? 'DESC' : ''}`,
    deptFirst: (desc = false) =>
      ` ORDER BY department.name ${desc ? 'DESC' : ''},
          role.title ${desc ? 'DESC' : ''},
          emp.last_name ${desc ? 'DESC' : ''},
          emp.first_name ${desc ? 'DESC' : ''}`,
  },
});

const INSERT = Object.freeze({
  department: ({name}) => sql`INSERT INTO department (name) VALUES (${name})`,
  role: ({title, salary, departmentId}) =>
    sql`INSERT INTO role (title, salary, department_id) VALUES (${title}, ${salary}, ${departmentId})`,
  employee: ({firstName, lastName, roleId, managerId}) => sql`INSERT INTO employee
      (first_name, last_name, role_id, manager_id)
      VALUES (${firstName}, ${lastName}, ${roleId}, ${managerId})`,
});

const UPDATE = Object.freeze({
  employee: {
    roleId: (employeeId, roleId) => sql`UPDATE employee SET role_id = ${roleId} WHERE id = ${employeeId}`,
    managerId: (employeeId, managerId) => sql`UPDATE employee SET manager_id = ${managerId} WHERE id = ${employeeId}`,
  },
});

const DELETE = Object.freeze({
  department: {id: (id) => sql`DELETE FROM department WHERE id = ${id}`},
  role: {id: (id) => sql`DELETE FROM role WHERE id = ${id}`},
  employee: {id: (id) => sql`DELETE FROM employee WHERE id = ${id}`},
});

const QUERY = Object.freeze({
  departmentSalaryTotalsByJobRole: (departmentId) => sql`SELECT department.name,
      role.title,
      COUNT(employee.id) AS headcount,
      (COUNT(employee.id) * role.salary) AS total_salary
    FROM employee
      INNER JOIN role ON employee.role_id = role.id
      INNER JOIN department ON role.department_id = department.id
    WHERE department.id = ${departmentId}
    GROUP BY employee.role_id
    ORDER BY role.title`,
  salaryTotalsByDepartment: () => sql`SELECT department,
      sum(sum_role) AS total_salary
    FROM (
      SELECT department.name AS department,
        (COUNT(employee.id) * role.salary) AS sum_role
      FROM employee
        INNER JOIN role on employee.role_id = role.id
        INNER JOIN department on role.department_id = department.id
      GROUP BY employee.role_id
    ) AS sum_wages_by_role
    GROUP BY department
    ORDER BY department`,
});

const dbWrapper = {
  connection: mysql.createConnection({supportBigNumbers: true, ...CONNECTION_SETTINGS}),
  sort: {department: 'name', role: 'deptFirst', employee: 'deptFirst'},
  // error "handling"
  async _query(query) {
    try {
      const [rows] = await this.connection.execute(query);
      return rows;
    } catch (err) {
      return console.error(err);
    }
  },
  // setup & teardown
  async init() {
    try {
      this.connection = await this.connection;
    } catch (err) {
      return console.error(err.message);
    }
  },
  end() {
    return this.connection.end();
  },
  // read
  get(type, column, selector) {
    if (!Object.keys(SELECT).includes(type)) return;
    const query = SELECT[type]();
    if (column && selector !== undefined) {
      if (!Object.keys(WHERE[type]).includes(column)) return;
      query.append(WHERE[type][column](selector));
    }
    query.append(ORDER[type][this.sort[type]]());
    return this._query(query);
  },
  // create
  add(type, answers) {
    if (!Object.keys(INSERT).includes(type)) return;
    const query = INSERT[type](answers);
    return this._query(query);
  },
  // update
  change(type, property, selector, value) {
    if (!Object.keys(UPDATE).includes(type)) return;
    if (!Object.keys(UPDATE[type]).includes(property)) return;
    if (!type || !property) return;
    const query = UPDATE[type][property](selector, value);
    return this._query(query);
  },
  // delete
  remove(type, column, selector) {
    if (!Object.keys(DELETE).includes(type)) return;
    if (!Object.keys(DELETE[type]).includes(column)) return;
    const query = DELETE[type][column](selector);
    return this._query(query);
  },
  // other
  query(queryName, ...params) {
    if (!Object.keys(QUERY).includes(queryName)) return;
    const query = QUERY[queryName](...params);
    return this._query(query);
  },
};

module.exports = dbWrapper;
