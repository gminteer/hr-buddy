module.exports = (dbWrapper) => {
  return {
    choices: [
      {name: 'View employees by department', value: {action: 'filter', target: 'employee', filter: 'departmentId'}},
      {name: 'View employees by manager', value: {action: 'filter', target: 'employee', filter: 'managerId'}},
      {
        name: "View a department's total salary budget by job role",
        value: {action: 'total', target: 'salaryByJobRole', status: 'salaryTotal'},
      },
      {
        name: 'View total salary budget by department',
        value: {action: 'total', target: 'salaryByDepartment', status: 'salaryTotal'},
      },
    ],
    questions: {
      employee: {
        departmentId: {
          name: 'departmentId',
          message: 'Select a department',
          type: 'autocomplete',
          loop: false,
          source: async (_, input) =>
            (await dbWrapper.get('department', 'name', input)).map((row) => ({name: row.name, value: row.id})),
        },
        managerId: {
          name: 'managerId',
          message: 'Select a manager',
          type: 'autocomplete',
          loop: false,
          source: async (_, input) =>
            (await dbWrapper.get('employee', 'isManager', input)).map((row) => ({
              name: `${row.first_name} ${row.last_name}`,
              value: row.id,
            })),
        },
      },
      salaryByJobRole: {
        name: 'departmentId',
        message: 'Select a department',
        type: 'autocomplete',
        loop: false,
        source: async (_, input) =>
          (await dbWrapper.get('department', 'name', input)).map((row) => ({name: row.name, value: row.id})),
      },
      salaryByDepartment: [],
    },
  };
};
