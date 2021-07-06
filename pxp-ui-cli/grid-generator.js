const { connect } = require('../pxp-nd-cli/typeorm-connect');
const { getEntities, getColumns, getPathEntity } = require('./helpers/common');
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
  const t = '\t\t\t';
  const t2 = '\t\t\t\t';
  columns.forEach(col => {
    stream.write(t + col.name + ": {\n");
    stream.write(t2 + "type: '" + getColumnType(col.type) + "',\n");
    stream.write(t2 + "label: '" + _.startCase(col.name) + "',\n");
    if (col.default) {
      stream.write(t2 + "initialValue: '" + col.default + "',\n");
    }
    stream.write(t2 + "gridForm: { xs: 12, sm: 6 },\n");
    stream.write(t2 + "variant: 'outlined',\n");
    stream.write(t + "},\n");
  });
};

const writeGrid = async (entity, isFrom, columns) => {
  const nameFile = _.capitalize(entity);
  const nameRender = nameFile + (isFrom ? 'Form' : 'Grid');
  const fileDir = path.join(process.env.USERPROFILE, 'Downloads', nameRender + '.js');
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
      stream.write("import * as Yup from 'yup';\n");
      if (isFrom) {
        stream.write("import Form from '@pxp-ui/components/Form/Form';\n\n");
      } else {
        stream.write("import TablePxp from '@pxp-ui/components/Table/TablePxp';\n\n");
      }
      stream.write("const " + nameRender + " = () => {\n");
      stream.write("\tconst json" + nameFile + ' = {\n');
      //idStore
      stream.write("\t\tidStore: '" + primaryCol.name + "',\n");
      if (!isFrom) {
        stream.write("\t\tbuttonDel: true,\n");
        stream.write("\t\tbuttonNew: true,\n");
        stream.write("\t\tbuttonEdit: true,\n");
        //dataReader write
        stream.write("\t\tdataReader: {\n");
        stream.write("\t\t\tdataRows: 'data',\n");
        stream.write("\t\t\ttotal: 'count',\n");
        stream.write("\t\t},\n");
      }
      //columns write
      stream.write("\t\tcolumns: {\n");
      writeColumns(columns, stream);
      stream.write("\t\t},\n");
      if (!isFrom) {
        // dataTable write
        stream.write("\t\tgetDataTable: {\n");
        stream.write("\t\t\turl: '" + pathApi + "/list',\n");
        stream.write("\t\t\tmethod: 'GET',\n");
        stream.write("\t\t\tparams: {\n");
        stream.write("\t\t\t\tstart: '0',\n");
        stream.write("\t\t\t\tlimit: '10',\n");
        stream.write("\t\t\t\tdir: 'DESC',\n");
        stream.write("\t\t\t\tsort: '" + primaryCol.name + "',\n");
        stream.write("\t\t\t},\n");
        stream.write("\t\t\tload: true,\n");
        stream.write("\t\t},\n");
        // onSubmit
        stream.write("\t\tonSubmit: {\n");
        stream.write("\t\t\turlAdd: '" + pathApi + "/add',\n");
        stream.write("\t\t\turlEdit: '" + pathApi + "/edit',\n");
        stream.write("\t\t},\n");
        stream.write("\t\turlDelete: '" + pathApi + "/delete',\n");
        //
        stream.write("\t\tactionsTableCell: {\n");
        stream.write("\t\t\tbuttonDel: true,\n");
        stream.write("\t\t\tbuttonEdit: true,\n");
        stream.write("\t\t},\n");
      } else {
        // onSubmit
        stream.write("\t\tonSubmit: ({values}) => {\n");
        stream.write("\t\t\tconsole.log(values);\n");
        stream.write("\t\t},\n");
      }

      //
      stream.write("\t};\n");
      stream.write("\n");
      if (isFrom) {
        stream.write("\treturn <Form data={json" + nameFile + "} />;\n");
      } else {
        stream.write("\treturn <TablePxp dataConfig={json" + nameFile + "} />;\n");
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
  // console.log('[colss]', columns);
  await writeGrid(entity, isFrom, columns);
  const aux = isFrom ? 'Form' : 'Grid';
  console.log(chalk.greenBright(aux + ' Ui created correctly in: ', path.join(process.env.USERPROFILE, 'Downloads', entity + aux + '.js')));
  process.exit();
};

module.exports = {
  generateGridForm,
}