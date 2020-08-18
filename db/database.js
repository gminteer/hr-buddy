const sql = require('sql-template-strings');
const mysql = require('mysql2/promise');
// eslint-disable-next-line node/no-unpublished-require
const CONNECTION_SETTINGS = require('./connection.json');

const dbWrapper = {
  connection: mysql.createConnection({supportBigNumbers: true, ...CONNECTION_SETTINGS}),
  getSql: {
    department: () => sql`SELECT * FROM department`,
    role: () => sql`SELECT role.id AS id,
        title,
        salary,
        department.name AS department_name
      FROM role
        LEFT JOIN department ON department_id = department.id`,
    employee: () => sql`SELECT emp.id AS id,
        emp.first_name,
        emp.last_name,
        role.title AS title,
        role.salary AS salary,
        mgr.first_name AS manager_first_name,
        mgr.last_name AS manager_last_name,
        department.name AS department
      FROM employee emp
        LEFT JOIN role ON role_id = role.id
        LEFT JOIN department ON department_id = department.id
        LEFT JOIN employee mgr ON emp.manager_id = mgr.id`,
  },
  getOneSql: {
    department: (id) => sql` WHERE id = ${id}`,
    role: (id) => sql` WHERE role.id = ${id}`,
    employee: (id) => sql` WHERE emp.id = ${id}`,
  },
  async init() {
    try {
      this.connection = await this.connection;
    } catch (err) {
      return console.error(err.message);
    }
  },
  async end() {
    return this.connection.end();
  },
  async get(type, id) {
    if (!Object.keys(this.getSql).includes(type)) return;
    const query = this.getSql[type]();
    if (id) query.append(this.getOneSql[type](id));
    try {
      const [rows] = await this.connection.query(query);
      return rows;
    } catch (err) {
      console.error(err.message);
    }
  },
};

module.exports = dbWrapper;
