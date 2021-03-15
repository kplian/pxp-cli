const prompts = require('prompts');
const path = require('path');
const _ = require('lodash');
const { createConnections, getConnection } = require('typeorm');
const chalk = require('chalk');

const promptData = async (connections = []) => await prompts([
  {
    type: 'select',
    name: 'dataBase',
    message: 'Select database:',
    choices: connections.map((cnn) => ({
      title: cnn.name + ' => ' + cnn.options.database,
      value: cnn.name,
    }))
  }
]);

const connect = async () => {
  try {
    let options;
    options = require(path.join(process.cwd(), 'ormconfig.json'));
    const connections = await createConnections(options);
    const db = await promptData(connections);

    if (!db.dataBase) throw 'Thanks for using PXP-GENERATOR...!!!';
    
    const currentDb = _.find(connections, { name: db.dataBase });
    const connnection = getConnection(db.dataBase);
    const database = currentDb.options.database;
    return { connnection, database, currentDb };
  } catch(e) {
    console.log(chalk.red(e));
    process.exit(1);
  }
}

module.exports = {
  connect,
}