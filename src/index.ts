#!/usr/bin/env node --experimental-modules

import { Command } from 'commander';
import { checkAndInstallRequirements } from '@/utils/requirementsCheck';
import { compilePrograms } from '@/parser';
import {
  addProgram,
  createProjectStructure,
  initializeGit,
  installNpmPackages
} from '@/generator/program-generator';
import { runAleoNode } from '@/scripts/leo-node';
import { buildPrograms } from '@/scripts/compile';
import { runTest } from '@/scripts/test';
import { deploy } from '@/scripts/deploy';
import { leoExecute } from '@/scripts/execute';

function printProjectName() {
  console.log('     _    _                _ ____ ');
  console.log('    / \\  | | ___  ___     | / ___| ');
  console.log('   / _ \\ | |/ _ \\/ _ \\ _  | \\___ \\ ');
  console.log('  / ___ \\| |  __/ (_) | |_| |___) |');
  console.log(' /_/   \\_\\_|\\___|\\___/ \\___/|____/ ');
}

printProjectName();

const program = new Command();

program.version('0.2.4').description('AleoJS CLI');

program
  .command('init <project-name>')
  .description('Initialize your AleoJS project')
  .option('-p --program <name>', 'Initialize and add new program')
  .action(async (projectName, options: any) => {
    console.log('Initializing AleoJS project...');
    console.log('\n');
    const programName = options.program || 'sample_program';

    await checkAndInstallRequirements();
    const response = await createProjectStructure(projectName, programName);
    await addProgram(programName, response?.destination);
    try {
      await initializeGit(response?.destination);
    } catch (e) {
      console.error('Git setup error', e);
    }
    await installNpmPackages(response?.destination);
    console.log(
      `Checkout to ${projectName} directory for accessing the program`
    );

    process.exit(0);
  });

program
  .command('add <program-name>')
  .description('Add a new component or resource')
  .action(async (programName: string) => {
    await addProgram(programName);

    process.exit(0);
  });

program
  .command('compile')
  .description('Compile your AleoJS project')
  .action(async () => {
    console.log('Compiling AleoJS project...');
    // Add your compilation logic here
    await buildPrograms();
    // For ts files
    await compilePrograms();

    process.exit(0);
  });
program
  .command('unflatten')
  .description('Create leo build for programs')
  .action(async () => {
    console.log('Building leo programs...');
    // Add your compilation logic here
    await buildPrograms();

    process.exit(0);
  });

program
  .command('autogen')
  .description(
    'Generate ts types for contracts - use only after the build has been generated'
  )
  .action(async () => {
    console.log('Generating JS files...');
    // Add your compilation logic here
    await compilePrograms();

    process.exit(0);
  });

program
  .command('start node')
  .description('Run your AleoJS project')
  .option('-n --network <network-name>', 'Network name')
  .action(async (_, options) => {
    console.log('Running AleoJS project...');
    console.log(options);
    const networkName = options.network;

    if (networkName) {
      console.log('Run aleo node');
      await runAleoNode(networkName);
    }

    console.log('No network');
    // Add your run logic here
  });

program
  .command('run <file>')
  .description('Run file')
  // .requiredOption('-n --network <network-name>', 'Network name')
  .option('-n --network <network-name>', 'Network name')
  .action(async (file, options) => {
    console.log('No network');
    await runTest(file);
    process.exit(0);
  });

program
  .command('deploy <program-name>')
  .description('Deploy program')
  .option('-n --network <network-name>', 'Network name')
  .option('-i --private-key-index', 'Private key index on config')
  .action(async (programName, options) => {
    await deploy(programName, {
      privateKeyIndex: options.privateKeyIndex || 0,
      network: options.network || 'testnet'
    });
    process.exit(0);
  });

program
  .command('execute <file-path>')
  .description('Execute script')
  .action(async (filePath) => {
    await leoExecute(filePath);
    process.exit(0);
  });

program.parse(process.argv);
