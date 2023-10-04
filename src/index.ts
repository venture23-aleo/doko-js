#! /usr/bin/env node

import { Command } from 'commander';
import { checkAndInstallRequirements } from './utils/requirementsCheck';
import { parseAleo } from './parser';
import {
  createProjectStructure,
  generateProgram
} from './generator/program-generator';

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
    if (!options.program) {
      console.error('Program name is required');
      process.exit(1);
    }

    await checkAndInstallRequirements();
    createProjectStructure(projectName, programName);
    generateProgram(programName, projectName);
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
  .action(() => {
    console.log('Compiling AleoJS project...');
    // Add your compilation logic here
    parseAleo();
  });

program
  .command('run')
  .description('Run your AleoJS project')
  .action(() => {
    console.log('Running AleoJS project...');
    // Add your run logic here
  });

program.parse(process.argv);
