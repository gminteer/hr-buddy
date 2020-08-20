const sql = require('sql-template-strings');
const mysql = require('mysql2/promise');
// eslint-disable-next-line node/no-unpublished-require
const CONNECTION_SETTINGS = require('./connection.json');

const SELECT = Object.freeze({
  department: () => sql`SELECT * FROM department`,
  role: () => sql`SELECT role.id AS id,
      title,
      salary,
      department.name AS department
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
    departmentId: (departmentId) => sql` WHERE emp.department_id = ${departmentId}`,
    name: (name) =>
      sql` WHERE emp.first_name LIKE CONCAT('%',${name},'%') OR emp.last_name LIKE CONCAT('%',${name},'%')`,
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
    role: (employeeId, roleId) => sql`UPDATE employee SET role_id = ${roleId} WHERE id = ${employeeId}`,
  },
});
const dbWrapper = {
  connection: mysql.createConnection({supportBigNumbers: true, ...CONNECTION_SETTINGS}),
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
  get(type, column, value) {
    if (!Object.keys(SELECT).includes(type)) return;
    const query = SELECT[type]();
    if (column && value !== undefined) {
      if (!Object.keys(WHERE[type]).includes(column)) return;
      query.append(WHERE[type][column](value));
    }
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
    if (!type || !property) return;
    const query = UPDATE[type][property](selector, value);
    return this._query(query);
  },
};

module.exports = dbWrapper;
