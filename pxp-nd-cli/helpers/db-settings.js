

const getSchemaDatabase = (type) => {
  switch (type) {
    case 'mysql': return 'SELECT TABLE_NAME AS name FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?';
    case 'postgres': return "SELECT TABLE_NAME AS name FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_CATALOG = $1 AND TABLE_SCHEMA NOT IN ('pg_catalog', 'information_schema')";
    case 'mssql': return "SELECT TABLE_NAME AS name FROM databaseName.INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'";
    case 'mongodb': return '';
  }
};

const getSchemaColumns = (type) => {
  switch (type) {
    case 'mysql': return 'SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? ';
    case 'postgres': return 'SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_CATALOG = $1 AND TABLE_NAME = $2';
    case 'mssql': return '';
    case 'mongodb': return '';
  }
};

const getNamesPropertiesColumn = (type) => {
  switch (type) {
    case 'mysql': return {
      primary: 'COLUMN_KEY',
      name: 'COLUMN_NAME',
      type: 'DATA_TYPE',
      nullable: 'IS_NULLABLE',
      length: 'CHARACTER_MAXIMUM_LENGTH',
      default: 'COLUMN_DEFAULT',
    };
    case 'postgres': return {
      primary: 'column_key',
      name: 'column_name',
      type: 'data_type',
      nullable: 'is_nullable',
      length: 'character_maximum_length',
      default: 'column_default',
    };
    case 'mssql': return '';
    case 'mongodb': return '';
  }
};

module.exports = {
  getSchemaDatabase,
  getSchemaColumns,
  getNamesPropertiesColumn,
};