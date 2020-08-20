const inquirer = require('inquirer');

const mainMenu = require('./questions/main-menu');
const titleCase = require('./title-case');

const assembleMainMenu = (...menus) =>
  menus.reduce((accum, val) => accum.concat([...val, new inquirer.Separator()]), [new inquirer.Separator()]);

module.exports = async (db) => {
  const addMenus = require('./questions/add-menus')(db, titleCase);
  const changeMenus = require('./questions/change-menus')(db);

  mainMenu.choices = assembleMainMenu(mainMenu.choices, addMenus.choices, changeMenus.choices, [
    {name: 'Quit HR Buddy', value: 'quit'},
  ]);
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
