const prompts = require('prompts');
const path = require('path');
const fs = require('fs');
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
    pathOrmJson = path.join(process.cwd(), 'ormconfig.json');
    pathOrmJs = path.join(process.cwd(), 'ormconfig.js');

    if (fs.existsSync(pathOrmJson)) {
      options = require(pathOrmJson);
    } else if (fs.existsSync(pathOrmJs)) {
      options = require(pathOrmJs);
    } else {
      console.log(chalk.red('Error: Configuration file for typeOrm not found.'));
      process.exit(1);
    }
    const connections = await createConnections(options);
    const db = await promptData(connections);

    if (!db.dataBase) throw 'Thanks for using PXP-GENERATOR...!!!';

    const currentDb = _.find(connections, { name: db.dataBase });
    const connection = getConnection(db.dataBase);
    const database = currentDb.options.database;
    const type = currentDb.options.type;
    return { connection, database, currentDb, type };
  } catch (e) {
    console.log(chalk.red(e));
    process.exit(1);
  }
}

module.exports = {
  connect,
}