const inquirer = require('inquirer');

const mainMenu = require('./questions/main-menu')(inquirer.Separator);
const titleCase = require('./title-case');

module.exports = async (db) => {
  const addMenus = require('./questions/add-menus')(db, titleCase);
  mainMenu.choices = mainMenu.choices.concat([new inquirer.Separator(), ...addMenus.choices]);
  const changeMenus = require('./questions/change-menus')(db);
  mainMenu.choices = mainMenu.choices.concat([new inquirer.Separator(), ...changeMenus.choices]);
  mainMenu.choices;
  let choice;
  while (choice !== 'quit') {
    ({choice} = await inquirer.prompt(mainMenu));
    const {action, target} = choice;
    if (action && target) {
      switch (action) {
        case 'view': {
          console.table(await db.get(target));
          break;
        }
        case 'add': {
          const answers = await inquirer.prompt(addMenus.questions[target]);
          console.log(answers);
          const results = await db.add(target, answers);
          console.log(results);
          break;
        }
        case 'change': {
          const {property} = choice;
          const answers = await inquirer.prompt(changeMenus.questions[target][property]);
          console.log(answers);
          const [selector, value] = Object.values(answers);
          const results = await db.change(target, property, selector, value);
          console.log(results);
          break;
        }
      }
    }
  }
};
