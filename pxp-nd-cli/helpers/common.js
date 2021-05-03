const prompts = require('prompts');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

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

const writeColumnsEntity = (stream, columns) => {
  const colNameRender = (name) => {
    return name === false || name === true || !isNaN(name) ? name : "'" + _.snakeCase(name) + "'";
  };
  columns.forEach(column => {
    stream.write("\n");
    if (column.isId) {
      stream.write("\t@PrimaryGeneratedColumn({ name: '" + column.name + "' })\n");
    }
    else {
      const keysCol = Object.keys(_.omit(column, ['isId']));
      console.log('[keysCol]', keysCol);
      stream.write("\t@Column({" +
        keysCol.map((keyCol, i) => " " + keyCol + ": " + colNameRender(column[keyCol])) +
        " })" +
        "\n");
    }
    stream.write("\t" + column.name + ": " + column.type + ";\n");
  });
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
      case 'character varying':
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
  console.log('[cols]', columns);
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

const createModel = async (model, dir, columns = {}, isPxpEntity = false, isEntity = false) => {
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
        stream.write("@Entity({ name: '" + _.snakeCase(model) + "' })\n");
        if (isPxpEntity) {
          stream.write("export default class " + modelOrm + " extends BaseEntity {\n");
        } else {
          stream.write("export default class " + modelOrm + " {\n");
        }
        if (!isEntity) {
          writeColumns(stream, columns);
        } else {
          writeColumnsEntity(stream, columns);
        }
        stream.write("}\n");
        stream.end();
      });
      stream.on('finish', resolve);
    });
  }

  if (fs.existsSync(fileDir)) {
    const replace = await promptReplace();
    if (replace) {
      await write();
      console.log(chalk.greenBright('Model created correctly in: ', dir));
    } else {
      console.log(chalk.yellowBright('Thanks for using PXP-GENERATOR...!!!'));
      process.exit();
    }
  } else {
    await write();
  }
};

const verifyDirEntity = async () => {
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
    return dir;
  }
  else {
    console.log(chalk.red('The module does not exist: ', dir));
  }
};

module.exports = {
  createModel,
  verifyDirEntity,
}