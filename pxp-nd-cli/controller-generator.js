const prompts = require('prompts');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const { pluralize, promptReplace } = require('./helpers/common');
const { getModules, getEntitiesModule } = require('../pxp-ui-cli/helpers/common');

const getPropsController = async () => {
  const { name } = await prompts([
    {
      type: 'text',
      name: 'name',
      message: 'Controller class Name:'
  }]);
  
  const routeInitial = pluralize(name.toLowerCase().trim());
  const { route, module, modelConfig } = await prompts([
    {
      type: 'text',
      name: 'route',
      message: 'Default route:',
      initial: routeInitial,
    }, 
    {
      type: 'autocomplete',
      name: 'module',
      message: 'Select module:',
      choices: getModules().map((module) => ({
        title: module,
        value: module,
      }))
    },
    {
      type: 'toggle',
      name: 'modelConfig',
      message: 'Configure default model Entity?',
      initial: 'yes',
      active: 'yes',
      inactive: 'no'
    }
  ]);

  

  if (modelConfig) {
    const { entity } = await prompts([
      {
        type: 'autocomplete',
        name: 'entity',
        message: 'Select entity:',
        choices: getEntitiesModule(module).map((module) => ({
          title: module,
          value: module,
        }))
      }
    ]);
    return { name, route, module, entity };
  }
  return { name, route, module};
}

const writeController = async (props) => {
  let fileDir = path.join(process.cwd(), 'src', 'modules', props.module, 'controllers', props.name + '.ts');

  function write() {
    const stream = fs.createWriteStream(fileDir);
    return new Promise((resolve, reject) => {
      stream.once('open', (fd) => {
        if (props.entity) {
          stream.write("import { Controller, Model, Route } from '@pxp-nd/core';\n");
        } else {
          stream.write("import { Controller, Route } from '@pxp-nd/core';\n");
        }
        stream.write("\n");

        stream.write("@Route('/" + props.route + "')\n");
        if (props.entity) {
          stream.write("@Model('" + props.module + "/"+ props.entity + "')\n");
        }

        stream.write("export default class " + props.name + " extends Controller {\n");
        stream.write("\n");
        stream.write("}\n");
        stream.end();
      });
      stream.on('finish', resolve);
    });
  }

  if (fs.existsSync(fileDir)) {
    const replace = await promptReplace('controller');
    if (replace) {
      await write();
      console.log(chalk.greenBright('Controller created correctly in: ', fileDir));
    } else {
      console.log(chalk.yellowBright('Thanks for using PXP-GENERATOR...!!!'));
    }
  } else {
    await write();
    console.log(chalk.greenBright('Controller created correctly in: ', fileDir));
  }
}

const mainController = async () => {
  const propsEntity = await getPropsController();
  await writeController(propsEntity);
  process.exit();
}

module.exports = {
  mainController
};