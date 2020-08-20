module.exports = {
  type: 'list',
  name: 'choice',
  loop: false,
  choices: [
    {name: 'View all departments', value: {action: 'view', target: 'department'}},
    {name: 'View all roles', value: {action: 'view', target: 'role'}},
    {name: 'View all employees', value: {action: 'view', target: 'employee'}},
  ],
};
