const prompts = require('prompts');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');

const promptTable = async (connnection, database) => {
  const tables = await connnection.query("SELECT TABLE_NAME AS name FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?", [database]);
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

const columnsBuilder = async (connnection, database, table) => {
  const columns = await connnection
    .query("SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? ", [database, table]);
  const columnsBuild = {};

  columns.forEach((column) => {
    const nameOrm = _.camelCase(column.COLUMN_NAME);
    columnsBuild[nameOrm] = {
      primary: column.COLUMN_KEY === 'PRI' ? true : null,
      name: column.COLUMN_NAME === nameOrm ? null : column.COLUMN_NAME,
      type: column.DATA_TYPE,
      nullable: column.IS_NULLABLE === 'NO' ? false : null,
      length: column.CHARACTER_MAXIMUM_LENGTH,
      default: column.COLUMN_DEFAULT,
    };
  });
  return columnsBuild;
};


const writeColumns = (stream, columns) => {
  const renderType = (type) => {
    switch (type) {
      case 'int':
      case 'bigint':
      case 'tinyint':
      case 'smallint':
      case 'mediumint':
      case 'decimal':
      case 'integer':
      case 'double':
      case 'float':
      case 'year':
        return 'number';
      case 'date':
      case 'time':
      case 'timestamp':
      case 'datetime':
        return 'Date';
      case 'char':
      case 'blob':
      case 'tinyblob':
      case 'tinytext':
      case 'varchar':
      case 'text':
      case 'enum':
      case 'longtext':
        return 'string';
      default:
        return type;
    }
    ;
  };
  const colNameRender = (name) => {
    return name === false || name === true || !isNaN(name) ? name : "'" + name + "'";
  };
  const keys = Object.keys(columns);
  keys.forEach(key => {
    const col = _.omitBy(columns[key], _.isNull);
    const keysCol = Object.keys(col);
    stream.write("\n");
    if (col.primary) {
      stream.write("\t@PrimaryGeneratedColumn({ name: '" + col.name + "' })\n");
    }
    else {
      stream.write("\t@Column({" +
        keysCol.map((keyCol, i) => " " + keyCol + ": " + colNameRender(col[keyCol])) +
        " })" +
        "\n");
    }
    stream.write("\t" + key + ": " + renderType(columns[key].type) + ";\n");
  });
};


const promptReplace = async () => {
  const rpcl = await prompts([
    {
      type: 'toggle',
      name: 'replace',
      message: 'The entity already exists. Do you want to replace the file?',
      initial: false,
      active: 'yes',
      inactive: 'no'
    }
  ]);
  return rpcl.replace;
};

const createModel = async (model, dir, columns = {}) => {
  const modelOrm = model.charAt(0).toUpperCase() + _.camelCase(model.slice(1));

  const fileDir = dir + '/' + modelOrm + '.ts';


  function write() {
    const stream = fs.createWriteStream(fileDir);
    return new Promise((resolve, reject) => {
      stream.once('open', (fd) => {
        stream.write("import {\n");
        stream.write("\tOneToMany,\n");
        stream.write("\tJoinColumn,\n");
        stream.write("\tManyToOne,\n");
        stream.write("\tBaseEntity,\n");
        stream.write("\tEntity,\n");
        stream.write("\tPrimaryGeneratedColumn,\n");
        stream.write("\tColumn\n");
        stream.write("} from 'typeorm';\n");
        stream.write("\n");
        stream.write("@Entity({ name: '" + model + "' })\n");
        stream.write("export default class " + modelOrm + " extends BaseEntity {\n");
        writeColumns(stream, columns);
        stream.write("}\n");
        stream.end();
      });
      stream.on('finish', resolve);
    });
  }

  if (fs.existsSync(fileDir)) {
    const replace = await promptReplace();
    if (replace) {
      write();
    } else {
      console.log(chalk.yellowBright('Thanks for using PXP-GENERATOR...!!!'));
      process.exit();
    }
  } else {
    write();
  }
};


const moduleCreate = async (connnection, database) => {

  const table = await promptTable(connnection, database);
  if (!table.name) {
    console.log(chalk.yellowBright('Thanks for using PXP-GENERATOR...!!!'));
    process.exit();
  }

  const columns = await columnsBuilder(connnection, database, table.name);

  const data = await prompts([
    {
      type: 'text',
      name: 'module',
      initial: 'pxp',
      message: 'Enter PXP module name (pxp):',
    }
  ]);

  if (!data.module) {
    console.log(chalk.yellowBright('Thanks for using PXP-GENERATOR...!!!'));
    process.exit();
  }

  const dir = path.join(process.cwd(), 'src/modules', data.module, 'entity');
  const isModule = fs.existsSync(dir);
  if (isModule) {
    await createModel(table.name, dir, columns);
    console.log(chalk.greenBright('Model created correctly in: ', dir));
  }
  else {
    console.log(chalk.red('The module does not exist: ', dir));
  }
};

module.exports = {
  moduleCreate
};