const inquirer = require('inquirer');

const mainMenu = require('./questions/main-menu')(inquirer.Separator);
const titleCase = require('./title-case');

module.exports = async (db) => {
  const addMenus = require('./questions/add-menus')(db, titleCase);
  const changeMenus = require('./questions/change-menus')(db);
  let choice;
  while (choice !== 'quit') {
    ({choice} = await inquirer.prompt(mainMenu));
    const [action, target, property] = choice.split('.');
    if (action && target) {
      switch (action) {
        case 'view': {
          console.table(await db.get(target));
          break;
        }
        case 'add': {
          const answers = await inquirer.prompt(addMenus[target]);
          console.log(answers);
          const results = await db.add(target, answers);
          console.log(results);
          break;
        }
        case 'change': {
          const answers = await inquirer.prompt(changeMenus[target][property]);
          console.log(answers);
        }
      }
    }
  }
};
