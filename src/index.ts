#! /usr/bin/env node

const { Command } = require("commander");
const figlet = require("figlet");

const program = new Command();

console.log(figlet.textSync("AleoJS"));

program
  .version('1.0.0')
  .description('AleoJS CLI');

program
  .command('init')
  .description('Initialize your AleoJS project')
  .action(() => {
    console.log('Initializing AleoJS project...');
    // Add your initialization logic here
  });

program
  .command('add')
  .description('Add a new component or resource')
  .option('-c, --component <name>', 'Add a new component')
  .option('-r, --resource <name>', 'Add a new resource')
  .action((cmd: any) => {
    if (cmd.component) {
      console.log(`Adding component: ${cmd.component}`);
      // Add logic for adding a component here
    } else if (cmd.resource) {
      console.log(`Adding resource: ${cmd.resource}`);
      // Add logic for adding a resource here
    } else {
      console.log('No action specified. Use either -c or -r.');
    }
  });

program
  .command('compile')
  .description('Compile your AleoJS project')
  .action(() => {
    console.log('Compiling AleoJS project...');
    // Add your compilation logic here
  });

program
  .command('run')
  .description('Run your AleoJS project')
  .action(() => {
    console.log('Running AleoJS project...');
    // Add your run logic here
  });

program.parse(process.argv);
