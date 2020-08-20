module.exports = (db) => {
  let employeeName;
  return {
    choices: [{name: 'Update an employee role', value: {action: 'change', target: 'employee', property: 'role'}}],
    questions: {
      employee: {
        role: [
          {
            name: 'employeeId',
            message: 'Select an employee',
            type: 'autocomplete',
            source: async (_, input) =>
              (await db.get('employee', 'name', input)).map((row) => {
                employeeName = `${row.first_name} ${row.last_name}`;
                return {
                  name: `${row.first_name} ${row.last_name}`,
                  value: row.id,
                };
              }),
          },
          {
            name: 'roleId',
            message: () => `What's ${employeeName}'s new job title?`,
            type: 'autocomplete',
            source: async (_, input) =>
              (await db.get('role', 'fuzzy', input)).map((row) => ({
                name: `${row.department}/${row.title}`,
                value: row.id,
              })),
          },
        ],
      },
    },
  };
};
