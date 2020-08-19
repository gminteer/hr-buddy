// eslint-disable-next-line no-unused-vars
const consoleTable = require('console.table');
const ui = require('./lib/ui');
const db = require('./db/database');
(async () => {
  await db.init();
  await ui(db);
  await db.end();
})();
