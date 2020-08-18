// eslint-disable-next-line no-unused-vars
const consoleTable = require('console.table');

(async () => {
  const db = require('./db/database');
  await db.init();
  // await require('./util/seed-db')(db);
  console.table(await db.get('department'));
  // console.log(await db.get('department', 1));
  // console.log(await db.get('department', 9999));
  console.table(await db.get('role'));
  // console.log(await db.get('role', 1));
  // console.log(await db.get('role', 9999));
  // console.log(await db.get('employee'));
  db.end();
})();
