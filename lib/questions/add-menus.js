module.exports = (db, titleCase) => {
  return {
    choices: [
      {name: 'Add a department', value: {action: 'add', target: 'department'}},
      {name: 'Add a role', value: {action: 'add', target: 'role'}},
      {name: 'Add an employee', value: {action: 'add', target: 'employee'}},
    ],
    questions: {
      department: {
        name: 'name',
        message: "What's the department name?",
        type: 'input',
        filter: titleCase,
        validate: (val) => (val.length > 0 ? true : 'Please enter a department name'),
      },
      role: [
        {
          name: 'title',
          message: "What's the job title?",
          type: 'input',
          filter: titleCase,
          validate: (val) => (val.length > 0 ? true : 'Please enter a role name'),
        },
        {
          name: 'salary',
          message: (answers) => `How much does a ${answers.title} get paid per year?`,
          type: 'number',
          validate: (val) =>
            val > 15080.0 ? true : "Can't pay less than minimum wage (currently $15,080.00 per year)",
        },
        {
          name: 'departmentId',
          message: (answers) => `Which department does a ${answers.title} work in?`,
          type: 'list',
          choices: async () =>
            (await db.get('department')).map((row) => ({
              name: row.name,
              value: row.id,
            })),
        },
      ],
      employee: [
        {
          name: 'firstName',
          message: "What's the employee's first name?",
          type: 'input',
          filter: titleCase,
          validate: (val) => (val.length > 0 ? true : 'Please enter a first name'),
        },
        {
          name: 'lastName',
          message: (answers) => `What's ${answers.firstName}'s last name?`,
          type: 'input',
          filter: titleCase,
          validate: (val) => (val.length > 0 ? true : 'Please enter a last name'),
        },
        {
          name: 'roleId',
          message: (answers) => `What's ${answers.firstName} ${answers.lastName}'s job title?`,
          type: 'list',
          choices: async () =>
            (await db.get('role')).map((row) => ({
              name: `${row.department}/${row.title}`,
              value: row.id,
            })),
        },
        {
          name: 'managerId',
          message: (answers) => `Who will be ${answers.firstName} ${answers.lastName}'s manager?`,
          type: 'list',
          choices: async () =>
            (await db.get('employee')).map((row) => ({
              name: `${row.first_name} ${row.last_name}`,
              value: row.id,
            })),
        },
      ],
    },
  };
};
