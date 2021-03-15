const { moduleCreate } = require('./pxp-nd/model-generator');
const { connect } =require('./pxp-nd/typeorm-connect');
const chalk = require('chalk');


async function modelGenerate() {
  const { connnection, database } = await connect();
  await moduleCreate(connnection, database);
  console.log(chalk.yellowBright('Thanks for using PXP-GENERATOR...!!!'));
  process.exit();
}

module.exports = {
  modelGenerate,
}