const { moduleCreate } = require('./pxp-nd-cli/model-generator');
const { main: entityMain } = require('./pxp-nd-cli/entity-generator');
const { connect } = require('./pxp-nd-cli/typeorm-connect');
const { generateGridForm } = require('./pxp-ui-cli/grid-generator');
const { main: createBackend } = require('./pxp-nd-cli/new-project-create');
const { mainCreateProjectUI } = require('./pxp-ui-cli/new-project-create');
const { mainController } = require('./pxp-nd-cli/controller-generator');

const chalk = require('chalk');
const figlet = require('figlet');

function main() {
  console.log(chalk.greenBright(figlet.textSync('pxp-generator', { horizontalLayout: 'default' })));
  console.log(chalk.greenBright('======================================================================='));
}

async function modelGenerate() {
  const { connection, database, type } = await connect();
  await moduleCreate(connection, database, type);
  console.log(chalk.yellowBright('Thanks for using PXP-GENERATOR...!!!'));
  process.exit();
}

module.exports = {
  main,
  modelGenerate,
  entityMain,
  generateGridForm,
  createBackend,
  mainController,
  mainCreateProjectUI,
}