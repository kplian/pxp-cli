const prompts = require('prompts');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const promptReplace = async (name) => {
  const rpcl = await prompts([
    {
      type: 'toggle',
      name: 'replace',
      message: 'The ' + name + ' already exists. Do you want to replace the file?',
      initial: false,
      active: 'yes',
      inactive: 'no'
    }
  ]);
  return rpcl.replace;
};

const writeColumnsEntity = (stream, columns) => {
  const renderTypeInv = (type) => {
    switch (type) {
      case 'number':
        return 'integer';
      case 'Date':
        return 'date';
      case 'string':
        return 'varchar';
      case 'boolean':
        return 'tinyint';
      case 'array':
        return 'varchar';
      default:
        return type;
    };
  };
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
      stream.write("\t@Column({" +
        keysCol.map((keyCol, i) => {
          if (keyCol === 'type') {
            return " " + keyCol + ": '" + renderTypeInv(column[keyCol]) + "'";
          }
          return " " + keyCol + ": " + colNameRender(column[keyCol])}) +
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
    };
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
        keysCol.map((keyCol, i) => {
          return " " + keyCol + ": " + colNameRender(col[keyCol])
        })
        + " })" + "\n"
      );
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
        // stream.write("\tBaseEntity,\n");
        stream.write("\tEntity,\n");
        stream.write("\tPrimaryGeneratedColumn,\n");
        stream.write("\tColumn,\n");
        if (!isPxpEntity) {
          stream.write("\tBaseEntity,\n");
        }
        stream.write("} from 'typeorm';\n");
        
        if (isPxpEntity) {
          stream.write("import { PxpEntity } from '@pxp-nd/entities';\n");
        }

        stream.write("\n");
        stream.write("@Entity({ name: '" + _.snakeCase(model) + "' })\n");
        if (isPxpEntity) {
          stream.write("export default class " + modelOrm + " extends PxpEntity {\n");
        } else {
          stream.write("export default class " + modelOrm + " extends BaseEntity {\n");
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
    const replace = await promptReplace('entity');
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
    throw new Error(null);
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


const especialWords = {
  photo: 'photos',
  piano: 'pianos',
  zoo: 'zoos',
  chef: 'chefs',
  roof: 'roofs',
  child: 'children',
  woman: 'women',
  person: 'people',
  foot: 'feet',
  mouse: 'mice',
  tooth: 'teeth',
  man: 'men',
  goose: 'geese',
  ox: 'oxen',
  deer: 'deer',
  sheep: 'sheep',
  fish: 'fish',
  means: 'means',
  species: 'species',
  series: 'series',
  ice: 'ice',
};

function pluralize(string) {
  if (especialWords.hasOwnProperty(string)){
    return especialWords[string];
  }

  if (string.endsWith('ay') || string.endsWith('ey') || string.endsWith('oy')) {
    return string + 's';
  }

  if (string.endsWith('y')) {
    return string.substring(0, string.length - 1) + 'ies';
  }

  if (string.endsWith('s') || string.endsWith('z') || string.endsWith('x') || string.endsWith('ch') || string.endsWith('sh')) {
    return string + 'es';
  }

  if (string.endsWith('fe') || string.endsWith('f')) {
    const length = string.endsWith('f') ? 1 : 2;
    return string.substring(0, string.length - length) + 'ves';
  }
  
  if (string.endsWith('o')) {
    return string + 'es';
  }

  if (string.endsWith('ff')) {
    return string + 's';
  }

  return string + 's';
}

module.exports = {
  createModel,
  verifyDirEntity,
  pluralize,
  promptReplace,
}