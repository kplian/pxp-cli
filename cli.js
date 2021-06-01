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
    --grid,        -g  Generate Grid for pxp-ui
    --form,        -f  Generate Form for pxp-ui

	Examples
	  $ pxp --entity
`, {
  booleanDefault: undefined,
  flags: {
    newBackend: {
      type: 'boolean',
      default: false,
      alias: 'nd'
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
  }
});

const args = process.argv.slice(2);

switch (true) {
  case cli.flags.newBackend: cliPxp.createBackend(args); break;
  case cli.flags.newEntity: cliPxp.entityMain(); break;
  case cli.flags.entity: cliPxp.modelGenerate(); break;
  case cli.flags.grid: cliPxp.generateGridForm(); break;
  case cli.flags.form: cliPxp.generateGridForm(true); break;
  default: console.log('Option in development...!!!', ' pxp version 1.1.1');
}