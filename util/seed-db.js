/* eslint-disable camelcase */
const {fake} = require('faker');
const sql = require('sql-template-strings');
const titleCase = require('../lib/title-case');

const RANDOM_DEPARTMENT_NOUNS = [
  'Group',
  'Team',
  'Committee',
  'Corps',
  'Cadre',
  'Band',
  'Subcommittee',
  'Squad',
  'Initiative',
];
const RANDOM_DEPARTMENT_COUNT = 16;
const MIN_ROLES = 6;
const RANDOM_ROLES = 6;
const SALARY_RANGE = 125000.0;
const MIN_EMPLOYEES = 16;
const RANDOM_EMPLOYEES = 16;
const roleCount = [];

function randomGroupName() {
  const deptNoun = RANDOM_DEPARTMENT_NOUNS[Math.floor(Math.random() * RANDOM_DEPARTMENT_NOUNS.length)];
  return titleCase(fake(`{{company.catchPhraseNoun}} ${deptNoun}`));
}
module.exports = async (db) => {
  console.log('---\nDepartments\n---\n');
  const createDept = (name) => sql`INSERT INTO department (name) VALUES (${name})`;
  for (let i = 0; i < RANDOM_DEPARTMENT_COUNT; i++) {
    const name = randomGroupName();
    const [rows] = await db.connection.execute(createDept(name));
    console.log(`${name} (id: ${rows.insertId})`);
  }
  console.log('\n---\nRoles\n---\n');
  const createRole = (title, salary, department_id) =>
    sql`INSERT INTO role (title, salary, department_id) VALUES (${title}, ${salary}, ${department_id})`;
  for (let department_id = 1; department_id <= RANDOM_DEPARTMENT_COUNT; department_id++) {
    roleCount[department_id] = Math.floor(Math.random() * RANDOM_ROLES) + MIN_ROLES;
    console.log(`department: ${department_id}\n---\n`);
    for (let i = 0; i < roleCount[department_id]; i++) {
      const title = fake('{{name.jobArea}} {{name.jobType}}');
      const salary = Number((15080.0 + Math.random() * SALARY_RANGE).toFixed(2));
      const [rows] = await db.connection.execute(createRole(title, salary, department_id));
      console.log(`${title} (id ${rows.insertId})`);
    }
  }
  console.log('\n---\nEmployees\n---\n');
  const createEmployee = (first_name, last_name, role_id) =>
    sql`INSERT INTO employee (first_name, last_name, role_id) VALUES (${first_name}, ${last_name}, ${role_id})`;
  const addManager = (id, manager_id) => sql`UPDATE employee SET manager_id = ${manager_id} WHERE id = ${id}`;
  for (let department_id = 1; department_id <= RANDOM_DEPARTMENT_COUNT; department_id++) {
    const employeeCount = Math.floor(Math.random() * RANDOM_EMPLOYEES) + MIN_EMPLOYEES;
    const potentialManagers = [];
    for (let i = 0; i < employeeCount; i++) {
      const first_name = fake('{{name.firstName}}');
      const last_name = fake('{{name.lastName}}');
      const role_id = Math.ceil(Math.random() * roleCount[department_id]);
      const [rows] = await db.connection.execute(createEmployee(first_name, last_name, role_id));
      console.log(`${last_name}, ${first_name} (id: ${rows.insertId}) -- role: ${role_id}`);
      if (i < employeeCount / 6) {
        potentialManagers.push(rows.insertId);
      } else if (Math.random() < 0.75) {
        const manager_id = potentialManagers[Math.floor(Math.random() * potentialManagers.length)];
        await db.connection.execute(addManager(rows.insertId, manager_id));
        console.log(`${last_name}, ${first_name}: manager set to id ${manager_id}`);
      }
    }
  }
};
