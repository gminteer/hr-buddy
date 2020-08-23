#!/usr/bin/env node
// eslint-disable-next-line no-unused-vars
const consoleTable = require('console.table');
const ui = require('./lib/ui');
const dbWrapper = require('./lib/db-wrapper');
(async () => {
  await dbWrapper.init();
  await ui(dbWrapper);
  await dbWrapper.end();
})();
