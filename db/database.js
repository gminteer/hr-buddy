/* eslint-disable camelcase */
const sql = require('sql-template-strings');
const mysql = require('mysql2/promise');
// eslint-disable-next-line node/no-unpublished-require
const CONNECTION_SETTINGS = require('./connection.json');

const dbWrapper = {
  connection: mysql.createConnection({supportBigNumbers: true, ...CONNECTION_SETTINGS}),
  GET_SQL: Object.freeze({
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
        role.title AS title,
        role.salary AS salary,
        CONCAT (mgr.first_name, ' ', mgr.last_name) AS manager,
        department.name AS department
      FROM employee emp
        LEFT JOIN role ON role_id = role.id
        LEFT JOIN department ON department_id = department.id
        LEFT JOIN employee mgr ON emp.manager_id = mgr.id`,
  }),
  GET_ONE_SQL: Object.freeze({
    department: (id) => sql` WHERE id = ${id}`,
    role: (id) => sql` WHERE role.id = ${id}`,
    employee: (id) => sql` WHERE emp.id = ${id}`,
  }),
  ADD_SQL: Object.freeze({
    department: ({name}) => sql`INSERT INTO department (name) VALUES (${name})`,
    role: ({title, salary, department_id}) =>
      sql`INSERT INTO role (title, salary, department_id) VALUES (${title}, ${salary}, ${department_id})`,
    employee: ({first_name, last_name, role_id, manager_id}) => sql`INSERT INTO employee
        (first_name, last_name, role_id, manager_id)
        VALUES (${first_name}, ${last_name}, ${role_id}, ${manager_id})`,
  }),
  // error "handling"
  async _query(query) {
    try {
      // returns [rows, fields] 'fields' is some extra metadata this program hasn't found a use for yet...
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
  async end() {
    // This doesn't need to be async, but then it'd be the only function on dbWrapper that isn't async, so I think it's simpler this way...
    return this.connection.end();
  },
  // read
  async get(type, id) {
    if (!Object.keys(this.GET_SQL).includes(type)) return;
    if (id) return this.filter(type, this.GET_ONE_SQL[type](id));
    const query = this.GET_SQL[type]();
    return this._query(query);
  },
  async filter(type, filter) {
    if (!Object.keys(this.GET_SQL).includes(type)) return;
    if (!(filter instanceof sql.SQLStatement)) return;
    const query = this.GET_SQL[type]().append(filter);
    return this._query(query);
  },
  async getDeptIdFromRoleId(id) {
    if (!id) return;
    const query = sql`SELECT department_id FROM role WHERE id = ${id}`;
    const [row] = await this._query(query);
    return row.department_id;
  },
  async getEmployeesByDeptId(id) {
    if (!id) return;
    const filter = sql` WHERE department_id = ${id}`;
    return this.filter('employee', filter);
  },
  // create
  async add(type, answers) {
    if (!Object.keys(this.ADD_SQL).includes(type)) return;
    const query = this.ADD_SQL[type](answers);
    return this._query(query);
  },
};

module.exports = dbWrapper;
