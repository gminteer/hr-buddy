module.exports = (db) => {
  return {
    choices: [
      {name: 'Update an employee role', value: {action: 'change', target: 'employee', property: 'roleId'}},
      {name: 'Update an employee manager', value: {action: 'change', target: 'employee', property: 'managerId'}},
    ],
    questions: {
      employee: {
        roleId: [
          {
            name: 'employeeId',
            message: 'Select an employee',
            type: 'autocomplete',
            source: async (_, input) =>
              (await db.get('employee', 'name', input)).map((row) => ({
                name: `${row.first_name} ${row.last_name}`,
                value: row.id,
              })),
          },
          {
            name: 'roleId',
            message: async ({employeeId}) => {
              const [{first_name: firstName, last_name: lastName}] = await db.get('employee', 'id', employeeId);
              return `What's ${firstName} ${lastName}'s new job title?`;
            },
            type: 'autocomplete',
            source: async (_, input) =>
              (await db.get('role', 'fuzzy', input)).map((row) => ({
                name: `${row.department}/${row.title}`,
                value: row.id,
              })),
          },
        ],
        managerId: [
          {
            name: 'employeeId',
            message: 'Select an employee',
            type: 'autocomplete',
            source: async (_, input) =>
              (await db.get('employee', 'name', input)).map((row) => ({
                name: `${row.first_name} ${row.last_name}`,
                value: row.id,
              })),
          },
          {
            name: 'managerId',
            message: async ({employeeId}) => {
              const [{first_name: firstName, last_name: lastName}] = await db.get('employee', 'id', employeeId);
              return `Who's ${firstName} ${lastName}'s new manager?`;
            },
            type: 'autocomplete',
            source: async (_, input) =>
              (await db.get('employee', 'name', input)).map((row) => ({
                name: `${row.first_name} ${row.last_name}`,
                value: row.id,
              })),
          },
        ],
      },
    },
  };
};
