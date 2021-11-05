const { connect } = require('../pxp-nd-cli/typeorm-connect');
const { getEntities, getColumns, getPathEntity, t } = require('./helpers/common');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const prompts = require('prompts');
const chalk = require('chalk');

const getColumnType = (type) => {
  if (typeof type === 'function') {
    type = typeof type();
  }

  switch (type) {
    case 'number':
    case 'varchar': return 'TextField';
    case 'date': return 'DatePicker';
    case 'boolean': return 'Switch';
    default: return 'TextField';
  }
}

const writeColumns = (columns, stream) => {
  columns.forEach(col => {
    stream.write(t(3) + col.name + ": {\n");
    stream.write(t(4) + "label: '" + _.startCase(col.name) + "',\n");
    stream.write(t(4) + "formAttribute: {\n");
    stream.write(t(5) + "name: '" + col.name + "',\n");
    stream.write(t(5) + "label: '" + _.startCase(col.name) + "',\n");
    stream.write(t(5) + "type: '" + getColumnType(col.type) + "',\n");
    stream.write(t(5) + "size: 'small',\n");
    if (col.default) {
      stream.write(t(5) + "initialValue: '" + col.default + "',\n");
    }
    stream.write(t(5) + "gridForm: { xs: 6, sm: 6 },\n");
    stream.write(t(5) + "variant: 'outlined',\n");
    stream.write(t(4) + "},\n");
    stream.write(t(3) + "},\n");
  });
};

const writeGrid = async (entity, isFrom, columns) => {
  const nameFile = _.capitalize(entity);
  const nameRender = nameFile + (isFrom ? 'Form' : 'Grid');
  console.log('cli',process.env.USERPROFILE,process.env.HOME);
  const fileDir = path.join(process.env.USERPROFILE ? process.env.USERPROFILE : process.env.HOME, 'Downloads', nameRender + '.tsx');
  const primaryCol = _.find(columns, { isPrimary: true });
  const stream = fs.createWriteStream(fileDir);
  const pathEntity = getPathEntity(entity);
  let pathApi = '{apiUrl}';
  if (!pathEntity.error) {
    pathApi = pathEntity.module + '/' + entity;
  }

  return new Promise((resolve, reject) => {
    stream.once('open', (fd) => {
      stream.write("import React from 'react';\n");
      // stream.write("import * as Yup from 'yup';\n");
      if (isFrom) {
        stream.write("import Form from '@pxp-ui/components/Form/Form';\n\n");
      } else {
        stream.write("import PxpTable, { ConfigTableInterface } from 'pxp-table';\n\n");
      }
      stream.write("const " + nameRender + " = () => {\n");
      stream.write("\tconst config" + nameFile + ': ConfigTableInterface = {\n');
      // name
      stream.write(t(2) + "name: '" + primaryCol.name + "',\n");
      if (!isFrom) {
        // stream.write(t(2) + "buttonDel: true,\n");
        // stream.write(t(2) + "buttonNew: true,\n");
        // stream.write(t(2) + "buttonEdit: true,\n");        
      }
      //columns write
      stream.write(t(2) + "columns: {\n");
      writeColumns(columns, stream);
      stream.write(t(2) + "},\n");
      if (!isFrom) {
        // dataTable write
        stream.write(t(2) + "store: {\n");
        stream.write(t(3) + "type: 'remote',\n");
        // idStore
        stream.write(t(3) + "idStore: '" + primaryCol.name + "',\n");
        // dataReader write
        stream.write(t(3) + "dataReader: {\n");
        stream.write(t(4) + "dataRows: 'data',\n");
        stream.write(t(4) + "total: 'count',\n");
        stream.write(t(3) + "},\n");
        //
        stream.write(t(3) + "getDataConfig: {\n");
        stream.write(t(4) + "doRequest: {\n");
        stream.write(t(5) + "url: '" + pathApi + "/list',\n");
        stream.write(t(5) + "method: 'GET',\n");
        stream.write(t(5) + "params: {\n");
        stream.write(t(6) + "start: 0,\n");
        stream.write(t(6) + "limit: 50,\n");
        stream.write(t(6) + "dir: 'DESC',\n");
        stream.write(t(6) + "sort: '" + primaryCol.name + "',\n");
        stream.write(t(5) + "},\n");
        stream.write(t(4) + "},\n");
        stream.write(t(3) + "load: true,\n");
        stream.write(t(3) + "},\n");
        stream.write(t(2) + "},\n");
        // filter config
        stream.write(t(2) + "filterConfig: {\n");
        stream.write(t(3) + "filterName: 'genericFilterFields',\n");
        stream.write(t(3) + "filterValue: 'genericFilterValue',\n");
        stream.write(t(2) + "},\n");
        // form
        stream.write(t(2) + "form: {\n");
        // add
        stream.write(t(3) + "add: {\n");
        stream.write(t(4) + "name: 'add',\n");
        stream.write(t(4) + "onSubmit: {\n");
        stream.write(t(5) + "url: '" + pathApi + "/add',\n");
        stream.write(t(5) + "method: 'post',\n");
        stream.write(t(5) + "headers: {},\n");
        stream.write(t(5) + "extraParams: {},\n");
        stream.write(t(4) + "},\n");
        stream.write(t(3) + "},\n");
        //
        stream.write(t(3) + "edit: {\n");
        stream.write(t(4) + "name: 'edit',\n");
        stream.write(t(4) + "onSubmit: {\n");
        stream.write(t(5) + "url: '" + pathApi + "/edit',\n");
        stream.write(t(5) + "method: 'patch',\n");
        stream.write(t(5) + "headers: {},\n");
        stream.write(t(5) + "extraParams: {},\n");
        stream.write(t(4) + "},\n");
        stream.write(t(3) + "},\n");
        stream.write(t(2) + "},\n");
        //
        // stream.write(t(2) + "actionsTableCell: {\n");
        // stream.write(t(3) + "buttonDel: true,\n");
        // stream.write(t(3) + "buttonEdit: true,\n");
        // stream.write(t(2) + "},\n");
      } else {
        // onSubmit
        stream.write(t(2) + "onSubmit: ({values}) => {\n");
        stream.write(t(3) + "console.log(values);\n");
        stream.write(t(2) + "},\n");
      }

      //
      stream.write("\t};\n");
      stream.write("\n");
      if (isFrom) {
        stream.write("\treturn <Form data={config" + nameFile + "} />;\n");
      } else {
        stream.write("\treturn <TablePxp config={config" + nameFile + "} />;\n");
      }
      stream.write("}\n\n");
      stream.write("export default " + nameRender + ";");
      stream.end();
    });
    stream.on('finish', resolve);
  });

};

const promptColumns = async (entity, connection) => {
  let columns = getColumns(entity, connection);
  const primaryCol = _.find(columns, { isPrimary: true });
  columns = columns.filter(col => col.name !== primaryCol.name);

  const resp = await prompts([
    {
      type: 'multiselect',
      name: 'columns',
      message: 'Select the columns to display:',
      choices: columns.map((col) => ({
        title: col.name,
        value: col,
      })),
      // hint: '- Space to select. Return to submit',
    }
  ]);
  if (!resp.columns) {
    console.log(chalk.yellowBright('Thanks for using PXP-GENERATOR...!!!'));
    process.exit();
  }
  return [...resp.columns, primaryCol];
};

const promptEntity = async (connection) => {
  const entities = getEntities(connection);
  console.log('cli', entities);
  const resp = await prompts([
    {
      type: 'autocomplete',
      name: 'name',
      message: 'Select Entity:',
      choices: entities.map((entity) => ({
        title: entity,
        value: entity,
      }))
    }
  ]);
  if (!resp.name) {
    console.log(chalk.yellowBright('Thanks for using PXP-GENERATOR...!!!'));
    process.exit();
  }
  return resp.name;
};

const generateGridForm = async (isFrom = false) => {
  const { connection, type, database, currentDb } = await connect();
  // getEntities(connection);
  const entity = await promptEntity(connection);
  const columns = await promptColumns(entity, connection);
  console.log('[colss]', columns);
  await writeGrid(entity, isFrom, columns);
  const aux = isFrom ? 'Form' : 'Grid';
  console.log(chalk.greenBright(aux + ' Ui created correctly in: ', path.join(process.env.USERPROFILE ? process.env.USERPROFILE : process.env.HOME, 'Downloads', entity + aux + '.tsx')));
  process.exit();
};

module.exports = {
  generateGridForm,
};
