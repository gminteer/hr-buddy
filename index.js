const seedDb = require('./util/seed-db');
(async () => {
  const db = await require('./db/database');
  await seedDb(db);
  db.end();
})();
