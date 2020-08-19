module.exports = (Separator) => {
  return {
    type: 'list',
    name: 'choice',
    choices: [
      {name: 'View all departments', value: 'view.department'},
      {name: 'View all roles', value: 'view.role'},
      {name: 'View all employees', value: 'view.employee'},
      new Separator(),
      {name: 'Add a department', value: 'add.department'},
      {name: 'Add a role', value: 'add.role'},
      {name: 'Add an employee', value: 'add.employee'},
      new Separator(),
      {name: 'Quit HR Buddy', value: 'quit'},
    ],
  };
};
