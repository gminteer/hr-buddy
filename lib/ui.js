const inquirer = require('inquirer');

const mainMenu = require('./questions/main-menu');
const titleCase = require('./title-case');

const assembleMainMenu = (...menus) =>
  menus.reduce((accum, val) => accum.concat([...val, new inquirer.Separator()]), [new inquirer.Separator()]);

inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));
module.exports = async (db) => {
  const filterMenus = require('./questions/filter-menus')(db);
  const addMenus = require('./questions/add-menus')(db, titleCase);
  const changeMenus = require('./questions/change-menus')(db);

  mainMenu.choices = assembleMainMenu(mainMenu.choices, filterMenus.choices, addMenus.choices, changeMenus.choices, [
    {name: 'Quit HR Buddy', value: 'quit'},
  ]);
  const ui = new inquirer.ui.BottomBar();
  ui.log.write('HR Buddy!');
  let choice;
  while (choice !== 'quit') {
    ({choice} = await inquirer.prompt(mainMenu));
    const {action, target} = choice;
    if (action && target) {
      switch (action) {
        case 'view': {
          const results = await db.get(target);
          console.table(results);
          ui.log.write(`${results.length} ${target}s found`);
          break;
        }
        case 'filter': {
          const {filter} = choice;
          const answers = await inquirer.prompt(filterMenus.questions[target][filter]);
          const [selector, value] = Object.entries(answers)[0];
          const results = await db.get(target, selector, value);
          console.table(results);
          ui.log.write(`${results.length} ${target}s found`);
          break;
        }
        case 'add': {
          const answers = await inquirer.prompt(addMenus.questions[target]);
          const results = await db.add(target, answers);
          const name = answers.name || answers.title || `${answers.firstName} ${answers.lastName}`;
          ui.log.write(`New ${target} "${name}" (id: ${results.insertId})`);
          break;
        }
        case 'change': {
          const {property} = choice;
          const answers = await inquirer.prompt(changeMenus.questions[target][property]);
          const [selector, value] = Object.values(answers);
          const results = await db.change(target, property, selector, value);
          if (results.changedRows === 1) ui.log.write(`Changed ${target}'s ${property}`);
          break;
        }
      }
    }
  }
};
