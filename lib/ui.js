const util = require('util');
const inquirer = require('inquirer');
const figlet = require('figlet');
const figletText = util.promisify(figlet.text);

const titleCase = require('./title-case');

const assembleMainMenu = (...menus) =>
  menus.reduce((acc, val) => acc.concat([...val, new inquirer.Separator()]), [new inquirer.Separator()]);

const mainMenu = {
  type: 'list',
  name: 'choice',
  loop: false,
  choices: [
    {name: 'View all departments', value: {action: 'view', target: 'department'}},
    {name: 'View all roles', value: {action: 'view', target: 'role'}},
    {name: 'View all employees', value: {action: 'view', target: 'employee'}},
  ],
};

async function getSelectorName(dbWrapper, target, selector) {
  const [row] = await dbWrapper.get(target, 'id', selector);
  switch (target) {
    case 'department':
      return row.name;
    case 'role':
      return row.title;
    case 'employee':
      return `${row.first_name} ${row.last_name}`;
  }
}

inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

module.exports = async (dbWrapper) => {
  const filterMenus = require('./actions/filter')(dbWrapper);
  const addMenus = require('./actions/add')(dbWrapper, titleCase);
  const changeMenus = require('./actions/change')(dbWrapper);
  const removeMenus = require('./actions/remove')(dbWrapper);
  const sortMenus = require('./actions/sort')(dbWrapper);
  mainMenu.choices = assembleMainMenu(
    mainMenu.choices,
    filterMenus.choices,
    addMenus.choices,
    changeMenus.choices,
    removeMenus.choices,
    sortMenus.choices,
    [{name: 'Quit HR Buddy', value: 'quit'}]
  );
  const splash = await figletText('HR Buddy!', {font: 'Caligraphy2'});
  console.log(splash);
  const ui = new inquirer.ui.BottomBar();
  ui.log.write('Main Menu');
  let choice;
  while (choice !== 'quit') {
    ({choice} = await inquirer.prompt(mainMenu));
    const {action, target} = choice;
    if (action && target) {
      switch (action) {
        case 'view': {
          const results = await dbWrapper.get(target);
          if (Object.keys(results[0]).includes('salary')) {
            results.map((row) => {
              row.salary = Number(row.salary).toLocaleString('en-US', {style: 'currency', currency: 'USD'});
            });
          }
          console.table(results);
          ui.log.write(`${results.length} ${target}s found`);
          break;
        }
        case 'filter': {
          const {filter} = choice;
          const answers = await inquirer.prompt(filterMenus.questions[target][filter]);
          const [[selector, value]] = Object.entries(answers);
          const results = await dbWrapper.get(target, selector, value);
          if (Object.keys(results[0]).includes('salary')) {
            results.map((row) => {
              row.salary = Number(row.salary).toLocaleString('en-US', {style: 'currency', currency: 'USD'});
            });
          }
          console.table(results);
          ui.log.write(`${results.length} ${target}s found`);
          break;
        }
        case 'add': {
          const answers = await inquirer.prompt(addMenus.questions[target]);
          const results = await dbWrapper.add(target, answers);
          const name = answers.name || answers.title || `${answers.firstName} ${answers.lastName}`;
          ui.log.write(`New ${target} "${name}" (id: ${results.insertId})`);
          break;
        }
        case 'change': {
          const {property} = choice;
          const answers = await inquirer.prompt(changeMenus.questions[target][property]);
          const [selector, value] = Object.values(answers);
          const results = await dbWrapper.change(target, property, selector, value);
          const name = await getSelectorName(dbWrapper, target, selector);
          if (results.changedRows === 1) ui.log.write(`Changed ${name}'s ${property}`);
          break;
        }
        case 'remove': {
          const {id, confirm} = await inquirer.prompt(removeMenus.questions[target]);
          if (confirm) {
            const results = await dbWrapper.remove(target, 'id', id);
            if (results.changedRows === 1) ui.log.write(`Removed ${target}`);
          } else {
            ui.log.write('Cancelled');
          }
          break;
        }
        case 'total': {
          const {status} = action;
          const params = Object.values(await inquirer.prompt(filterMenus.questions[target]));
          const results = await dbWrapper.total(target, ...params);
          if (Object.keys(results[0]).includes('total_salary')) {
            results.map((row) => {
              row.total_salary = Number(row.total_salary).toLocaleString('en-US', {style: 'currency', currency: 'USD'});
            });
          }
          console.table(results);
          if (status === 'salaryTotal') {
            const departmentTotalSalary = results.reduce((acc, val) => (acc += Number(val.total_salary)), 0);
            ui.log.write(`Total salary budget: ${departmentTotalSalary.toFixed(2)}`);
          }
          break;
        }
        case 'sort': {
          // const results = Object.values(await inquirer.prompt(sortMenus.questions[target]));
          const [style, invert] = Object.values(await inquirer.prompt(sortMenus.questions[target]));
          dbWrapper.sort[target] = {style, invert};
        }
      }
    }
  }
};
