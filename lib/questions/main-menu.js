module.exports = (Separator) => {
  return {
    type: 'list',
    name: 'choice',
    choices: [
      {name: 'View all departments', value: {action: 'view', target: 'department'}},
      {name: 'View all roles', value: {action: 'view', target: 'role'}},
      {name: 'View all employees', value: {action: 'view', target: 'employee'}},
      new Separator(),
      {name: 'Quit HR Buddy', value: 'quit'},
    ],
  };
};
