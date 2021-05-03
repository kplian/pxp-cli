const _ = require('lodash');
const path = require('path');
const fs = require('fs');

const getPathEntity = (entity) => {
  const dir = path.join(process.cwd(), 'src/modules');
  const modules = fs.readdirSync(dir);
  let response = { error: true };
  modules.forEach(file => {
    const files = fs.readdirSync(path.join(dir, file, 'entity'));
    const exist = _.indexOf(files, entity + '.ts') >= 0;
    if (exist) {
      response = {
        path: path.join(dir, file, 'entity'),
        module: file,
      };
    }
  });
  return response;
};

const getEntities = (connection) => _.map(connection.entityMetadatas, item => item.name);

const getColumns = (entityName, connection) => {
  const entity = _.find(connection.entityMetadatas, { name: entityName }) || {};
  const columns = _.map(entity.columns, (item) => ({
    name: item.propertyName,
    length: item.length,
    isPrimary: item.isPrimary,
    isNullable: item.isNullable,
    type: item.type,
    default: item.default,
  }));
  return columns.filter(item => !_.includes(['createdBy', 'userIdAi', 'userAi', 'modifiedBy', 'createdAt', 'modifiedAt'], item.name));
};

module.exports = {
  getColumns,
  getEntities,
  getPathEntity,
};