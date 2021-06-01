Welcome to the pxp-cli wiki!

# PXP-CLI
- The PXP-CLI is a generator for pxp-ui and pxp-nd.
## Install
- In the console we execute this command, once the command is executed the generator will be installed.

	`npm install -g cli-pxp`

## Using PXP-CLI
- To have more information about what the generator can do, we can run this command.

	`pxp --help`

- This is what will appear on the console.

```
  _ ____  ___ __         __ _  ___ _ __   ___ _ __ __ _| |_ ___  _ __ 
 | '_ \ \/ / '_ \ _____ / _` |/ _ \ '_ \ / _ \ '__/ _` | __/ _ \| '__|
 | |_) >  <| |_) |_____| (_| |  __/ | | |  __/ | | (_| | || (_) | |   
 | .__/_/\_\ .__/       \__, |\___|_| |_|\___|_|  \__,_|\__\___/|_|   
 |_|       |_|          |___/
=======================================================================

  Generator for pxp-ui and pxp-nd

  Usage
    $ pxp

  Options
    --entity,     -e  Generate model pxp-nd from database
    --newEntity, -ne  Generate new entity file
    --controller, -c  Generate controller pxp-nd
    --relation,   -r  Generate model relations pxp-nd
     --grid,       -g  Generate Grid for pxp-ui
     --form,       -f  Generate Form for pxp-ui

  Examples
    $ pxp --entity
```
- To update pxp-cli in the console we use this command.

	`npm install -g cli-pxp@latest`

- We can use the generator to create entity, newEntity, controller, relation, grid and form.
Having created our component in the generator, it will go to our downloads folder, there we can see the generated component.
