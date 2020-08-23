module.exports = (dbWrapper) => {
  return {
    choices: [
      {name: 'Change department sort order', value: {action: 'sort', target: 'department'}},
      {name: 'Change job role sort order', value: {action: 'sort', target: 'role'}},
      {name: 'Change employee sort order', value: {action: 'sort', target: 'employee'}},
    ],
    questions: {
      department: [
        {
          name: 'departmentSort',
          message: 'How should departments be sorted?',
          type: 'list',
          loop: false,
          choices: [
            {name: 'Alphabetically by name', value: 'name'},
            {name: 'By ID number', value: 'id'},
          ],
        },
        {name: 'invertSort', message: 'Reverse sort order?', type: 'confirm', default: false},
      ],
      role: [
        {
          name: 'roleSort',
          message: 'How should job roles be sorted?',
          type: 'list',
          loop: false,
          choices: [
            {name: 'Alphabetically by job title', value: 'title'},
            {name: 'Alphabetically by department, then by job title', value: 'deptFirst'},
            {name: 'By ID number', value: 'id'},
          ],
        },
        {name: 'invertSort', message: 'Reverse sort order?', type: 'confirm', default: false},
      ],
      employee: [
        {
          name: 'employeeSort',
          message: 'How should employees be sorted?',
          type: 'list',
          loop: false,
          choices: [
            {name: 'Alphabetically by last name', value: 'lastName'},
            {name: 'Alphabetically by first name', value: 'firstName'},
            {name: 'Alphabetically by department, then job title, then last name, then first name', value: 'deptFirst'},
            {name: 'By ID number', value: 'id'},
          ],
        },
        {name: 'invertSort', message: 'Reverse sort order?', type: 'confirm', default: false},
      ],
    },
  };
};
