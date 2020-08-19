const sql = require('sql-template-strings');
module.exports = (db, titleCase) => {
  return {
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
        message: (answers) => `How much does a ${answers.title} get paid?`,
        type: 'number',
        validate: (val) => (val > 15080.0 ? true : "Can't pay less than minimum wage (currently $15,080.00 per year)"),
      },
    ],
    employee: [
      {
        name: 'first_name',
        message: "What's the employee's first name?",
        type: 'input',
        filter: titleCase,
        validate: (val) => (val.length > 0 ? true : 'Please enter a first name'),
      },
      {
        name: 'last_name',
        message: (answers) => `What's ${answers.first_name}'s last name?`,
        type: 'input',
        filter: titleCase,
        validate: (val) => (val.length > 0 ? true : 'Please enter a last name'),
      },
      {
        name: 'role',
        message: (answers) => `What's ${answers.first_name} ${answers.last_name}'s job title?`,
        type: 'list',
        choices: async () =>
          // translate database rows into inquirer choices
          (await db.get('role')).map((row) => ({
            name: `${row.department_name}/${row.title}`,
            value: row.id,
          })),
      },
      {
        name: 'manager',
        message: (answers) => `Who will ${answers.first_name} ${answers.last_name} report to?`,
        type: 'list',
        choices: async (answers) => await db.filter('employee', sql` WHERE employee.`),
      },
    ],
  };
};
