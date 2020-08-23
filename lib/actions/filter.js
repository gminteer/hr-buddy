module.exports = (db) => {
  return {
    choices: [
      {name: 'View employees by department', value: {action: 'filter', target: 'employee', filter: 'departmentId'}},
      {name: 'View employees by manager', value: {action: 'filter', target: 'employee', filter: 'managerId'}},
      {
        name: "View a department's total salary budget by job role",
        value: {action: 'query', target: 'departmentSalaryTotalsByJobRole', status: 'salaryTotal'},
      },
      {
        name: 'View total salary budget by department',
        value: {action: 'query', target: 'salaryTotalsByDepartment', status: 'salaryTotal'},
      },
    ],
    questions: {
      employee: {
        departmentId: {
          name: 'departmentId',
          message: 'Select a department',
          type: 'autocomplete',
          source: async (_, input) =>
            (await db.get('department', 'name', input)).map((row) => ({name: row.name, value: row.id})),
        },
        managerId: {
          name: 'managerId',
          message: 'Select a manager',
          type: 'autocomplete',
          source: async (_, input) =>
            (await db.get('employee', 'isManager', null)).map((row) => ({
              name: `${row.first_name} ${row.last_name}`,
              value: row.id,
            })),
        },
      },
      departmentSalaryTotalsByJobRole: {
        name: 'departmentId',
        message: 'Select a department',
        type: 'autocomplete',
        source: async (_, input) =>
          (await db.get('department', 'name', input)).map((row) => ({name: row.name, value: row.id})),
      },
      salaryTotalsByDepartment: [],
    },
  };
};
