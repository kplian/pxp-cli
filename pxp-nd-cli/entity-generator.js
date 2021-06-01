const prompts = require('prompts');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const { createModel, verifyDirEntity } = require('./helpers/common');

const getNameEntity = async () => await prompts([
  {
    type: 'text',
    name: 'name',
    message: 'Entity class Name:'
  },
  {
    type: 'toggle',
    name: 'isPxpEntity',
    message: 'Entity is an extension of Pxp Entity?',
    initial: 'yes',
    active: 'yes',
    inactive: 'no'
  },
]);

const getColumnName = async () => {
  const result = await prompts({
    type: 'text',
    name: 'name',
    message: 'Specify the property name:'
  });
  return result.name;
};

const getIsPrimaryColumn = async () => {
  const result = await prompts({
    type: 'toggle',
    name: 'isId',
    message: 'Is id the property of ID?',
    initial: 'no',
    active: 'yes',
    inactive: 'no'
  });
  return result.isId;
};

const getColumnProps = async () => await prompts([
  {
    type: 'select',
    name: 'type',
    message: 'Kind of property',
    choices: [
      { title: 'string', value: 'string' },
      { title: 'number', value: 'number' },
      { title: 'boolean', value: 'boolean' },
      { title: 'Date', value: 'Date' },
      { title: 'array', value: 'array' },
    ],
  },
  {
    type: 'toggle',
    name: 'nullable',
    message: 'It is necessary?',
    initial: 'no',
    active: 'no',
    inactive: 'yes'
  },
]);

const addProperties = async (name) => {
  const columns = [];
  let verifyColumnName = true;
  let verifyIsId = false, setId = false;

  while (verifyColumnName) {
    console.log('\nWe are going to add ' + (columns.length > 0 ? 'another' : 'a') + ' property to', chalk.yellowBright(name));
    console.log('Specify an empty property name when done\n');
    const nameColumn = await getColumnName();

    if (!verifyIsId) {
      verifyIsId = await getIsPrimaryColumn();
    }

    if (nameColumn === '') {
      verifyColumnName = false;
    } else {
      const props = await getColumnProps();
      columns.push({ name: nameColumn, ...props, isId: !setId && verifyIsId ? true : false });
      setId = verifyIsId;
    }
  }
  return columns;
};



const main = async () => {
  const propsEntity = await getNameEntity();
  const columns = await addProperties(propsEntity.name);
  const dir = await verifyDirEntity();
  await createModel(propsEntity.name, dir, columns, propsEntity.isPxpEntity, true);
}

module.exports = {
  main
};