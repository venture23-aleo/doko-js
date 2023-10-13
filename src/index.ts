#! /usr/bin/env node

import { Command } from 'commander';
import { checkAndInstallRequirements } from './utils/requirementsCheck';
import { compilePrograms } from './parser';
import {
  createProjectStructure,
  generateProgram
} from './generator/program-generator';
import { runAleoNode } from './scripts/runAleoNode';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const figlet = require('figlet');

const program = new Command();

console.log(figlet.textSync('AleoJS'));

program.version('1.0.0').description('AleoJS CLI');

program
  .command('init <project-name>')
  .description('Initialize your AleoJS project')
  .option('-p --program <name>', 'Initialize and add new program')
  .action(async (projectName, options: any) => {
    console.log('Initializing AleoJS project...');
    console.log('\n');
    const programName = options.program || 'sample_program';

    await checkAndInstallRequirements();
    await createProjectStructure(projectName, programName);
    await generateProgram(programName, projectName);
    console.log(`Checkout to ${programName} & run the code`);
    process.exit(0);
  });

program
  .command('add <program-name>')
  .description('Add a new component or resource')
  .action((programName: string) => {
    generateProgram(programName);
  });

program
  .command('compile')
  .description('Compile your AleoJS project')
  .action(async () => {
    console.log('Compiling AleoJS project...');
    // Add your compilation logic here
    await compilePrograms();
    process.exit(0);
  });

program
  .command('run node')
  .description('Run your AleoJS project')
  .option('-n --network <network-name>', 'Network name')
  .action((_, options) => {
    console.log('Running AleoJS project...');
    console.log(options);
    const networkName = options.network;

    if (networkName) {
      console.log('Run aleo node');
      runAleoNode(networkName);
    }

    console.log('No network');
    // Add your run logic here
  });

program.parse(process.argv);
