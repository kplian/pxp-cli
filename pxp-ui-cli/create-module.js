const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const prompts = require('prompts');
const readline = require('readline');

const promptModule = async () => {
  const resp = await prompts([
    {
      type: 'text',
      name: 'module',
      message: 'Module name:',
    }
  ]);
  if (!resp.module) {
    console.log(chalk.yellowBright('Thanks for using PXP-GENERATOR...!!!'));
    process.exit();
  }
  return resp.module.replace(/ /g, '');
};

const verifyPxpProject = async () => {
  const package = await require(path.join(process.cwd(), 'package.json'));
  if (!package || (!package.dependencies['react'] && !package.dependencies['@pxp-ui/core'])) {
    console.log(chalk.redBright('Invalid project PXP-UI.'));
    process.exit(1);
  }
};

const createModuleFolder = async (module) => {
  const dir = path.join(process.cwd(), 'src', 'modules');
  const dirModule  = path.join(dir, module);
  if(fs.existsSync(dir)){
    fs.mkdirSync(dirModule, 0744);
    fs.mkdirSync(path.join(dirModule, 'pages'), 0744);
    fs.copyFileSync(
      path.join(__dirname, 'helpers/pageBase.tsx'),
      path.join(dirModule, 'pages/index.tsx')
    );
    await modifyPagesMaster(module);
    console.log(chalk.greenBright('Module "' + module + '" created correctly.'));
    process.exit(0);
  } else {
    console.log(chalk.redBright('Module "'+module+'" already exists.'));
    process.exit(1);
  }
};

const modifyPagesMaster = async (module) => {
  const filePath = path.join(process.cwd(), 'src/modules/index.tsx');
  const data = fs.readFileSync(filePath, 'utf-8').split('\n');
  const nameModule = module + 'Pages';
  const output = [];
  // console.log('[data]', data);
  let findPages = false;
  let findImport = true;
  let writeImport = false;

  for (let i = 0; i < data.length; i++) {
    const value = data[i];
    if (!value.includes('import ') && !value.includes('from'))
    { 
      findImport = false;
    }
    // if((value === '' || value.includes('const pages')) && !findPages) {
    if (!findImport && !writeImport) {
      output.push(
        `import ${nameModule} from './${module}/pages';`
        );
      writeImport = true;
    }

    if(value.includes('const pages = {')) {
      findPages = true;
    }

    if(findPages && value === '};') {
      output.push('  ...' + nameModule  + ',');
    }
    output.push(value);
  }
  // console.log('[out]', output.join('\n'));
  fs.writeFileSync(filePath, output.join('\n'), 'utf-8');
}

const mainCreateModule = async () => {
  const module = await promptModule();
  await verifyPxpProject();
  await createModuleFolder(module);
}

module.exports = {
  mainCreateModule,
};
