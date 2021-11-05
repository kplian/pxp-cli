const meow = require('meow');
const cliPxp = require('./');

cliPxp.main();

const cli = meow(`
	Usage
	  $ pxp

	Options
	  --newBackend,  -b  Generate new backend project pxp-nd
	  --entity,      -e  Generate model pxp-nd from database
	  --newEntity,   -n  Generate new entity file
	  --controller,  -c  Generate controller pxp-nd
	  --relation,    -r  Generate model relations pxp-nd
    \t*** PXP UI ***\n
    --newUi,       -u  Generate new UI project pxp-ui
    --grid,        -g  Generate Grid for pxp-ui
    --form,        -f  Generate Form for pxp-ui
    --uiModule,    -m  Generate Module for pxp-ui
    --version,     -v  Current version for pxp-cli

	Examples
	  $ pxp --entity
`, {
  booleanDefault: undefined,
  flags: {
    newBackend: {
      type: 'boolean',
      default: false,
      alias: 'b'
    },
    newUi: {
      type: 'boolean',
      default: false,
      alias: 'u'
    },
    entity: {
      type: 'boolean',
      default: false,
      alias: 'e'
    },
    newEntity: {
      type: 'boolean',
      default: false,
      alias: 'ne'
    },
    controller: {
      type: 'boolean',
      default: false,
      alias: 'c'
    },
    relation: {
      type: 'boolean',
      default: false,
      alias: 'r'
    },
    grid: {
      type: 'boolean',
      default: false,
      alias: 'g'
    },
    form: {
      type: 'boolean',
      default: false,
      alias: 'f'
    },
    uiModule: {
      type: 'boolean',
      default: false,
      alias: 'm'
    },
    version: {
      type: 'boolean',
      default: false,
      alias: 'v'
    },
  }
});

const args = process.argv.slice(2);

const getVersion = () => {
  const package = require('./package.json');
  console.log(package.version);
};
console.log('aqui');
try {
  switch (true) {
    case cli.flags.newBackend: cliPxp.createBackend(args); break;
    case cli.flags.newUi: cliPxp.mainCreateProjectUI(args); break;
    case cli.flags.newEntity: cliPxp.entityMain(); break;
    case cli.flags.entity: cliPxp.modelGenerate(); break;
    case cli.flags.grid: cliPxp.generateGridForm(); break;
    case cli.flags.form: cliPxp.generateGridForm(true); break;
    case cli.flags.controller: cliPxp.mainController(); break;
    case cli.flags.uiModule: cliPxp.mainCreateModule(); break;
    case cli.flags.version: getVersion(); break;
    default: console.log('Option in development...!!!');
  }
} catch (err) {
  cliPxp.handleError(err);
}
