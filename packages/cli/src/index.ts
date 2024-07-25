#!/usr/bin/env -S node --experimental-modules

import { Command } from 'commander';
import { DokoJSLogger, checkAndInstallRequirements } from '@doko-js/utils';
import { compilePrograms } from '@doko-js/core';
import {
  addProgram,
  createProjectStructure,
  initializeGit,
  installNpmPackages
} from '@/scripts/program-generator';
import { runAleoNode } from '@/scripts/leo-node';
import { buildPrograms } from '@/scripts/compile';
import { runTest } from '@/scripts/test';
import { deploy } from '@/scripts/deploy';
import { leoExecute } from '@/scripts/execute';
import { readFileSync } from 'fs';

const pkg = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8')
);

const setLogLevel = (logLevel: string | number) => {
  DokoJSLogger.setLogLevel(logLevel || DokoJSLogger.LogLevels.INFO);
};

function printProjectName() {
  console.log('  ____        _             _ ____  ');
  console.log(' |  _ \\  ___ | | _____     | / ___| ');
  console.log(' | | | |/ _ \\| |/ / _ \\ _  | \\___ \\ ');
  console.log(' | |_| | (_) |   | (_) | |_| |___) |');
  console.log(' |____/ \\___/|_|\\_\\___/ \\___/|____/ ');
}

printProjectName();

const program = new Command();

program.version(pkg.version).description('DokoJS CLI');

program
  .command('init <project-name>')
  .description('Initialize your DokoJS project')
  .option('-p --program <name>', 'Initialize and add new program')
  .option(
    '-v --verbose <logLevel>',
    `Verbose logs
     Supported options: (default value is 1)
     0 | debug - All
     1 | info - Info, Warn and Errors
     2 | warn - Warnings and Errors
     3 | error - Errors
    `,
    DokoJSLogger.LogLevels.INFO
  )
  .action(async (projectName, options: any) => {
    setLogLevel(options.verbose);
    DokoJSLogger.info('Initializing DokoJS project...\n');
    const programName = options.program || 'sample_program';

    await checkAndInstallRequirements();
    const response = await createProjectStructure(projectName, programName);
    await addProgram(programName, response?.destination);
    try {
      await initializeGit(response?.destination);
    } catch (e) {
      DokoJSLogger.error(`Git setup error ${e}`);
    }
    try {
      await installNpmPackages(response?.destination);
      DokoJSLogger.info(
        `Checkout to ${projectName} directory for accessing the program`
      );
      process.exit(0);
    } catch (e) {}
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
  .description('Compile your DokoJS project')
  .option(
    '-v --verbose <logLevel>',
    `Verbose logs
     Supported options: (default value is 1)
     0 | debug - All
     1 | info - Info, Warn and Errors
     2 | warn - Warnings and Errors
     3 | error - Errors
    `,
    DokoJSLogger.LogLevels.INFO
  )
  .action(async (options) => {
    setLogLevel(options.verbose);
    // Add your compilation logic here
    const { status } = await buildPrograms();
    // For ts files
    if (status !== 'error') await compilePrograms();

    process.exit(0);
  });
program
  .command('unflatten')
  .description('Create leo build for programs')
  .action(async () => {
    DokoJSLogger.info('Building leo programs...');
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
    DokoJSLogger.info('Generating JS files...');
    // Add your compilation logic here
    await compilePrograms();

    process.exit(0);
  });

// @TODO: Add this when implementing leo node
// program
//   .command('start node')
//   .description('Run your DokoJS project')
//   .option('-n --network <network-name>', 'Network name')
//   .action(async (_, options) => {
//     console.log('Running DokoJS project...');
//     console.log(options);
//     const networkName = options.network;

//     if (networkName) {
//       console.log('Run aleo node');
//       await runAleoNode(networkName);
//     }

//     console.log('No network');
//     // Add your run logic here
//   });

program
  .command('run <file>')
  .description('Run file')
  // .requiredOption('-n --network <network-name>', 'Network name')
  .option('-n --network <network-name>', 'Network name')
  .action(async (file, options) => {
    if (!options.NetworkName) DokoJSLogger.warn('No network');
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
