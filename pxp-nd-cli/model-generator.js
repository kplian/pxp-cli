const prompts = require('prompts');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const { createModel, verifyDirEntity } = require('./helpers/common');
const { getSchemaDatabase, getSchemaColumns, getNamesPropertiesColumn } = require('./helpers/db-settings');

const promptTable = async (connection, database, type) => {
  const query = getSchemaDatabase(type);
  const tables = await connection.query(query, [database]);
  return await prompts([
    {
      type: 'autocomplete',
      name: 'name',
      message: 'Select table:',
      choices: tables.map((table) => ({
        title: table.name,
        value: table.name,
      }))
    }
  ]);
};

const columnsBuilder = async (connection, database, table, type) => {
  const query = getSchemaColumns(type);
  const columns = await connection
    .query(query, [database, table]);
  const names = getNamesPropertiesColumn(type);
  const columnsBuild = {};

  columns.forEach((column) => {
    const nameOrm = _.camelCase(column[names.name]);
    columnsBuild[nameOrm] = {
      primary: column[names.primary] === 'PRI' || column[names.primary] === 'YES' || (column[names.default] && column[names.default].includes('nextval')) ? true : null,
      name: column[names.name] === nameOrm ? null : column[names.name],
      type: column[names.type],
      nullable: column[names.nullable] === 'NO' ? false : null,
      length: column[names.length],
      default: column[names.default],
    };
  });
  return columnsBuild;
};
const moduleCreate = async (connection, database, type) => {

  const table = await promptTable(connection, database, type);
  if (!table.name) {
    console.log(chalk.yellowBright('Thanks for using PXP-GENERATOR...!!!'));
    process.exit();
  }

  const columns = await columnsBuilder(connection, database, table.name, type);
  const dir = await verifyDirEntity();
  await createModel(table.name, dir, columns);
};

module.exports = {
  moduleCreate
};