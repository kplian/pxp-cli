const shell = require('shelljs');
const chalk = require('chalk');
const Listr = require('listr');
const path = require('path');
const fse = require('fs-extra');

const tasks = (projectDirectory) => new Listr([
  {
    title: 'Generate pxp-ui-base project',
    task: () => {
      return new Promise((resolve, reject) => {
        fse.copy(path.join(__dirname, '/base'), path.join(process.cwd(), projectDirectory), { recursive: true } ,function (err) {
          if (err) {
            reject(err);
          } else {
            resolve(true);
          }
        });
      });
    },
  },
	{
		title: 'Install package dependencies with npm',
		task: () => {
      return new Promise((resolve, reject) => {
        shell.cd(projectDirectory);
        shell.exec('npm i --legacy-peer-deps', ()=>{
          resolve(true);
        });
      });
    }
	},
  {
    title: 'Install package @pxp-ui',
    task: () => {
      return new Promise((resolve, reject) => {
        shell.cd(projectDirectory);
        shell.exec('npm i @pxp-ui/core @pxp-ui/components @pxp-ui/hooks @pxp-ui/themes --legacy-peer-deps', () => {
          resolve(true);
        });
      });
    }
  },
]);

const successCreate = (projectDirectory, directory) => {
  console.log(`\nSuccess! Created ${projectDirectory} at ${directory}`);
  console.log('Inside that directory, you can run several commands:');
  console.log(
    '\n',
    chalk.blueBright('  yarn start'),
    '\n    Start the development server.'
  );
  console.log('\nWe suggest that you begin by typing:');
  console.log(
    '\n',
    chalk.blueBright('  cd ') + projectDirectory + '\n',
    chalk.blueBright('  yarn start')
  );
  console.log('\nEnjoy!\n');
  process.exit();
};

const mainCreateProjectUI = (args) => {
  const projectDirectory = args[1] || null;
  
  if(!projectDirectory) {
    console.log('Please specify the project directory:');
    console.log(
      '  ',
      chalk.blueBright('pxp --newUI'), 
      chalk.greenBright('<project-directory>')
    );
    console.log('\nFor example:');
    console.log(
      '  ',
      chalk.blueBright('pxp --newUI'),
      chalk.greenBright('my-pxp-ui')
    );
    console.log('\nRun pxp --help to see all options.');
    process.exit();
  }

  const directory = path.join(process.cwd(), projectDirectory);
  console.log(
    '\nCreating a new pxp UI app in ',
    chalk.greenBright(directory),
    '.\n'
  );
  
  tasks(projectDirectory).run().then(()=>{
    successCreate(projectDirectory, directory);
  }).catch(err => {
    console.error(err);
  });
};

module.exports = {
  mainCreateProjectUI,
}