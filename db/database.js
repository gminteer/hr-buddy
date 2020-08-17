const mysql = require('mysql2/promise');
// eslint-disable-next-line node/no-unpublished-require
const CONNECTION_SETTINGS = require('./connection.json');

const connection = mysql.createConnection({supportBigNumbers: true, namedPlaceholders: true, ...CONNECTION_SETTINGS});

module.exports = connection;
