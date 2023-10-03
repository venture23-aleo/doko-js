#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const requirementsCheck_1 = require("./utils/requirementsCheck");
const figlet = require("figlet");
const program = new commander_1.Command();
console.log(figlet.textSync("AleoJS"));
program
    .version('1.0.0')
    .description('AleoJS CLI');
program
    .command('init')
    .description('Initialize your AleoJS project')
    .action(() => {
    console.log('Initializing AleoJS project...');
    console.log("\n");
    (0, requirementsCheck_1.checkAndInstallRequirements)();
});
program
    .command('add')
    .description('Add a new component or resource')
    .option('-c, --component <name>', 'Add a new component')
    .option('-r, --resource <name>', 'Add a new resource')
    .action((cmd) => {
    if (cmd.component) {
        console.log(`Adding component: ${cmd.component}`);
        // Add logic for adding a component here
    }
    else if (cmd.resource) {
        console.log(`Adding resource: ${cmd.resource}`);
        // Add logic for adding a resource here
    }
    else {
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
//# sourceMappingURL=index.js.map