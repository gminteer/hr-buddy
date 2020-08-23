const sql = require('sql-template-strings');
const mysql = require('mysql2/promise');
// eslint-disable-next-line node/no-unpublished-require
const CONNECTION_SETTINGS = require('../db/connection.json');

const QUERY = Object.freeze({
  select: {
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
  },
  where: {
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
      isManager: (name) => {
        const where = sql` WHERE emp.id IN (SELECT manager_id FROM employee)`;
        if (name) {
          where.append(
            sql` AND (emp.first_name LIKE CONCAT('%',${name},'%') OR emp.last_name LIKE CONCAT('%',${name},'%'))`
          );
        }
        return where;
      },
      managerId: (managerId) => sql` WHERE emp.manager_id = ${managerId}`,
      name: (name) =>
        sql` WHERE emp.first_name LIKE CONCAT('%',${name},'%') OR emp.last_name LIKE CONCAT('%',${name},'%')`,
    },
  },
  order: {
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
      firstName: (desc = false) =>
        ` ORDER BY emp.first_name ${desc ? 'DESC' : ''}, emp.last_name ${desc ? 'DESC' : ''}`,
      deptFirst: (desc = false) =>
        ` ORDER BY department.name ${desc ? 'DESC' : ''},
          role.title ${desc ? 'DESC' : ''},
          emp.last_name ${desc ? 'DESC' : ''},
          emp.first_name ${desc ? 'DESC' : ''}`,
    },
  },
  insert: {
    department: ({name}) => sql`INSERT INTO department (name) VALUES (${name})`,
    role: ({title, salary, departmentId}) =>
      sql`INSERT INTO role (title, salary, department_id) VALUES (${title}, ${salary}, ${departmentId})`,
    employee: ({firstName, lastName, roleId, managerId}) => sql`INSERT INTO employee
      (first_name, last_name, role_id, manager_id)
      VALUES (${firstName}, ${lastName}, ${roleId}, ${managerId})`,
  },
  update: {
    employee: {
      roleId: (employeeId, roleId) => sql`UPDATE employee SET role_id = ${roleId} WHERE id = ${employeeId}`,
      managerId: (employeeId, managerId) => sql`UPDATE employee SET manager_id = ${managerId} WHERE id = ${employeeId}`,
    },
  },
  delete: {
    department: {id: (id) => sql`DELETE FROM department WHERE id = ${id}`},
    role: {id: (id) => sql`DELETE FROM role WHERE id = ${id}`},
    employee: {id: (id) => sql`DELETE FROM employee WHERE id = ${id}`},
  },
  total: {
    salaryByJobRole: (departmentId) => sql`SELECT department.name,
        role.title,
        COUNT(employee.id) AS headcount,
        (COUNT(employee.id) * role.salary) AS total_salary
      FROM employee
        INNER JOIN role ON employee.role_id = role.id
        INNER JOIN department ON role.department_id = department.id
      WHERE department.id = ${departmentId}
      GROUP BY employee.role_id
      ORDER BY role.title`,
    salaryByDepartment: () => sql`SELECT department,
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
  },
});

const dbWrapper = {
  connection: mysql.createConnection({supportBigNumbers: true, ...CONNECTION_SETTINGS}),
  sort: {department: 'name', role: 'deptFirst', employee: 'deptFirst'},
  // error "handling"
  async _execute(query) {
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
  get(type, column, selector = '') {
    if (!Object.keys(QUERY.select).includes(type)) return;
    const query = QUERY.select[type]();
    if (column) {
      if (!Object.keys(QUERY.where[type]).includes(column)) return;
      query.append(QUERY.where[type][column](selector));
    }
    query.append(QUERY.order[type][this.sort[type]]());
    return this._execute(query);
  },
  // create
  add(type, answers) {
    if (!Object.keys(QUERY.insert).includes(type)) return;
    const query = QUERY.insert[type](answers);
    return this._execute(query);
  },
  // update
  change(type, property, selector, value) {
    if (!Object.keys(QUERY.update).includes(type)) return;
    if (!Object.keys(QUERY.update[type]).includes(property)) return;
    if (!type || !property) return;
    const query = QUERY.update[type][property](selector, value);
    return this._execute(query);
  },
  // delete
  remove(type, column, selector) {
    if (!Object.keys(QUERY.delete).includes(type)) return;
    if (!Object.keys(QUERY.delete[type]).includes(column)) return;
    const query = QUERY.delete[type][column](selector);
    return this._execute(query);
  },
  // other
  total(queryName, ...params) {
    if (!Object.keys(QUERY.total).includes(queryName)) return;
    const query = QUERY.total[queryName](...params);
    return this._execute(query);
  },
};

module.exports = dbWrapper;
