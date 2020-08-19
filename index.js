// eslint-disable-next-line no-unused-vars
const consoleTable = require('console.table');
const ui = require('./lib/ui');
const db = require('./db/database');
(async () => {
  await db.init();
  // await require('./util/seed-db')(db);
  // console.table(await db.get('department'));
  await ui(db);
  await db.end();
})();
