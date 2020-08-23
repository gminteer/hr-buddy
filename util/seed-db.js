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
const RANDOM_DEPARTMENT_COUNT = 4;
const MIN_ROLES = 4;
const RANDOM_ROLES = 2;
const SALARY_RANGE = 75000.0;
const MIN_EMPLOYEES = 8;
const RANDOM_EMPLOYEES = 4;

const roles = {};

function randomGroupName() {
  const deptNoun = RANDOM_DEPARTMENT_NOUNS[Math.floor(Math.random() * RANDOM_DEPARTMENT_NOUNS.length)];
  return titleCase(fake(`{{company.catchPhraseNoun}} ${deptNoun}`));
}
async function seed({connection}) {
  console.log('---\nDepartments\n---\n');
  const createDept = (name) => sql`INSERT INTO department (name) VALUES (${name})`;
  for (let i = 0; i < RANDOM_DEPARTMENT_COUNT; i++) {
    const name = randomGroupName();
    const [rows] = await connection.execute(createDept(name));
    console.log(`${name} (id: ${rows.insertId})`);
  }
  console.log('\n---\nRoles\n---\n');
  const createRole = (title, salary, department_id) =>
    sql`INSERT INTO role (title, salary, department_id) VALUES (${title}, ${salary}, ${department_id})`;
  for (let department_id = 1; department_id <= RANDOM_DEPARTMENT_COUNT; department_id++) {
    const roleCount = Math.floor(Math.random() * RANDOM_ROLES) + MIN_ROLES;
    roles[department_id] = [];
    console.log(`department: ${department_id}\n---\n`);
    for (let i = 0; i < roleCount; i++) {
      const title = fake('{{name.jobArea}} {{name.jobType}}');
      const salary = Number((15080.0 + Math.random() * SALARY_RANGE).toFixed(2));
      const [rows] = await connection.execute(createRole(title, salary, department_id));
      console.log(`${title} (id ${rows.insertId})`);
      roles[department_id].push(rows.insertId);
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
      const role_id = roles[department_id][Math.floor(Math.random() * roles[department_id].length)];
      const [rows] = await connection.execute(createEmployee(first_name, last_name, role_id));
      console.log(`${last_name}, ${first_name} (id: ${rows.insertId}) -- role: ${role_id}`);
      if (i < employeeCount / 6) {
        potentialManagers.push(rows.insertId);
      } else if (Math.random() < 0.75) {
        const manager_id = potentialManagers[Math.floor(Math.random() * potentialManagers.length)];
        await connection.execute(addManager(rows.insertId, manager_id));
        console.log(`${last_name}, ${first_name}: manager set to id ${manager_id}`);
      }
    }
  }
}

const dbWrapper = require('../lib/db-wrapper');
(async () => {
  await dbWrapper.init();
  await seed(dbWrapper);
  await dbWrapper.end();
})();
