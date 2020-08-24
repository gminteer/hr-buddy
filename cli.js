#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');

// eslint-disable-next-line no-unused-vars
const consoleTable = require('console.table');
const ui = require('./lib/ui');
(async () => {
  try {
    await fs.promises.access(path.join(__dirname, './db/connection.json'));
  } catch (err) {
    console.log('Missing MySQL connection info.');
    console.log('You\'ll need to create a file called "connection.json" in the db/ folder with the following:');
    console.log('{');
    console.log('\t"host": "{{ MySQL HOSTNAME (probably "localhost") }}"');
    console.log('\t"user": "{{ MySQL USERNAME (probably "root" or "dba") }}"');
    console.log('\t"password": "{{ PASSWORD (probably "12345") }}"');
    console.log(
      '\t"database": "hr_buddy" (this can probably be anything as long as the user has create/drop table rights)'
    );
    console.log('}');
    console.log('\n---\nExiting...');
    process.exit(os.constants.errno.ENOENT);
  }
  const dbWrapper = require('./lib/db-wrapper');
  await dbWrapper.init();
  await ui(dbWrapper);
  await dbWrapper.end();
})();
