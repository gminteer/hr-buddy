module.exports = (dbWrapper) => {
  return {
    choices: [
      {name: 'Remove a department', value: {action: 'remove', target: 'department'}},
      {name: 'Remove a role', value: {action: 'remove', target: 'role'}},
      {name: 'Remove an employee', value: {action: 'remove', target: 'employee'}},
    ],
    questions: {
      department: [
        {
          name: 'id',
          message: 'Select a department',
          type: 'autocomplete',
          source: async (_, input) =>
            (await dbWrapper.get('department', 'name', input)).map((row) => ({name: row.name, value: row.id})),
        },
        {name: 'confirm', message: "Are you sure? This can't be undone.", type: 'confirm'},
      ],
      role: [
        {
          name: 'id',
          message: 'Select a role',
          type: 'autocomplete',
          source: async (_, input) =>
            (await dbWrapper.get('role', 'fuzzy', input)).map((row) => ({
              name: `${row.department}/${row.title}`,
              value: row.id,
            })),
        },
        {name: 'confirm', message: "Are you sure? This can't be undone.", type: 'confirm'},
      ],
      employee: [
        {
          name: 'id',
          message: 'Select an employee',
          type: 'autocomplete',
          source: async (_, input) =>
            (await dbWrapper.get('employee', 'name', input)).map((row) => ({
              name: `${row.first_name} ${row.last_name}`,
              value: row.id,
            })),
        },
        {name: 'confirm', message: "Are you sure? This can't be undone.", type: 'confirm'},
      ],
    },
  };
};
