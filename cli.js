const meow = require('meow');
const cliPxp = require('./');

cliPxp.main();

const cli = meow(`
	Usage
	  $ cli-pxp

	Options
	  --entity,     -e  Generate model pxp-nd
	  --controller, -c  Generate controller pxp-nd
	  --relation,   -r  Generate model relations pxp-nd

	Examples
	  $ cli-pxp --entity
`, {
  booleanDefault: undefined,
  flags: {
    entity: {
      type: 'boolean',
      default: false,
      alias: 'e'
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
  }
});

if(cli.flags.entity) {
  cliPxp.modelGenerate();
} else {
  console.log('Option in development...!!!');
}