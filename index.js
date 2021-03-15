const { moduleCreate } = require('./pxp-nd/model-generator');
const { connect } =require('./pxp-nd/typeorm-connect');
const chalk = require('chalk');
const figlet = require('figlet');

function main() {
  console.log(chalk.greenBright(figlet.textSync('pxp-generator', { horizontalLayout: 'default' })));
  console.log(chalk.greenBright('======================================================================='));
}

async function modelGenerate() {
  const { connnection, database } = await connect();
  await moduleCreate(connnection, database);
  console.log(chalk.yellowBright('Thanks for using PXP-GENERATOR...!!!'));
  process.exit();
}

module.exports = {
  main,
  modelGenerate,
}