const shell = require('shelljs');
const chalk = require('chalk');
const Listr = require('listr');
const path = require('path');
const fse = require('fs-extra');
const { extractFile } = require('../extract-zip');

const tasks = (projectDirectory) => new Listr([
	// {
  //   title: 'Checking git',
  //   task: () => 
  //   {
  //     if (!shell.which('git')) {
  //       shell.echo('Sorry, git is needed to create the application.');
  //       shell.exit(1);
  //     }            
  //     // if (result !== '') {
  //     // 	throw new Error('Unclean working tree. Commit or stash changes first.');
  //     // }
  //   }
  // },
  {
    title: 'Generate pxp-nd-base project',
    task: () => {
      // return new Promise((resolve, reject)=>{
      //   shell.exec('git clone git@github.com:kplian/pxp-nd-base.git ' + projectDirectory, ()=>{
      //     // shell.mv('pxp-nd-base/', 'new-backend/');
      //     shell.cd(projectDirectory);
      //     shell.rm('-rf', '.git/');
      //     resolve(true);
      //   });
      // });
      // return new Promise((resolve, reject) => {
      //   fse.copy(path.join(__dirname, '/base'), path.join(process.cwd(), projectDirectory), { recursive: true } ,function (err) {
      //     if (err) {
      //       reject(err);
      //     } else {
      //       resolve(true);
      //     }
      //   });
      // });
      return new Promise((resolve, reject) => {
        shell.exec('curl -L -O https://github.com/kplian/pxp-nd-base/archive/refs/heads/main.zip', function(){
          // shell.mv('pxp-nd-base/', 'new-backend/');
          // shell.cd(projectDirectory);
          // shell.rm('-rf', '.git/');
          resolve(true);          
        });
      });
    },
  },
  {
    title: 'Copy files project',
    task: () => {
      return new Promise((resolve, reject) => {
        extractFile(path.join(process.cwd(), 'main.zip')).then(() => resolve(true));
      });
    }
  },
  {
		title: 'Install package dependencies with npm',
		task: () => {
      return new Promise((resolve, reject) => {
        shell.mv('pxp-nd-base-main', projectDirectory)
        shell.rm('-rf', 'main.zip')
        shell.cd(projectDirectory);
        shell.exec('npm i', ()=>{
          resolve(true);
        });
      });
    }
	},
  {
		title: 'Install @pxp-nd/core',
		task: () => {
      return new Promise((resolve, reject) => {
        shell.cd(projectDirectory);
        shell.exec('npm i @pxp-nd/core', ()=>{
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
    chalk.blueBright('  npm start'),
    '\n    Start the development server.'
  );
  console.log(
    '\n',
    chalk.blueBright('  npm run dev'),
    '\n    Start the development server. When your files change, the app will update automatically.'
  );
  console.log('\nWe suggest that you begin by typing:');
  console.log(
    '\n',
    chalk.blueBright('  cd ') + projectDirectory + '\n',
    chalk.blueBright('  npm start')
  );
  console.log('\nEnjoy!\n');
  process.exit();
};

const main = (args) => {
  const projectDirectory = args[1] || null;
  
  if(!projectDirectory) {
    console.log('Please specify the project directory:');
    console.log(
      '  ',
      chalk.blueBright('pxp --newBackend '), 
      chalk.greenBright('<project-directory>')
    );
    console.log('\nFor example:');
    console.log(
      '  ',
      chalk.blueBright('pxp --newBackend'),
      chalk.greenBright('my-pxp-backend')
    );
    console.log('\nRun pxp --help to see all options.');
    process.exit();
  }

  const directory = path.join(process.cwd(), projectDirectory);
  console.log(
    '\nCreating a new pxp backend app in ',
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
  main,
}