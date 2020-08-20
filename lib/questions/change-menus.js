module.exports = (db) => {
  return {
    employee: {
      role: [
        {
          name: 'employee',
          message: 'Select an employee',
          type: 'list',
          choices: async () =>
            (await db.get('employee')).map((row) => ({
              name: `${row.first_name} ${row.last_name}`,
              value: {id: row.id, name: `${row.first_name} ${row.last_name}`},
            })),
        },
        {
          name: 'roleId',
          message: (answers) => `What's ${answers.employee.name}'s new job title?`,
          type: 'list',
          choices: async () =>
            (await db.get('role')).map((row) => ({
              name: `${row.department}/${row.title}`,
              value: row.id,
            })),
        },
      ],
    },
  };
};
