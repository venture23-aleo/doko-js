import path from 'path';
import { spawn } from 'child_process';
import readline from 'readline';
import fse from 'fs-extra';

const userShell = process.env.SHELL || '/bin/sh';

function toSnakeCase(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^\w-]+/g, '');
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function generateProgram(programName: string, projectName?: string) {
  const parsedProgramName = toSnakeCase(programName);
  const command = projectName
    ? `cd ${projectName}/programs && leo new ${parsedProgramName}`
    : `cd programs && leo new ${parsedProgramName}`;
  const shellProcess = spawn(userShell, ['-c', command]);
  shellProcess.stdout.on('data', (data) => {
    console.log(data.toString());
  });

  shellProcess.stderr.on('data', (data) => {
    console.log(data.toString());
  });

  shellProcess.on('close', (code) => {
    rl.close();
  });
}

async function createProjectStructure(
  projectName: string,
  programName: string
) {
  const projectRoot = projectName; // Use the provided project name
  const leoProjectName = toSnakeCase(programName);

  const CURR_DIR = process.cwd();
  const templatesDir = path.join(__dirname, '../template');
  const source = path.join(templatesDir, '');
  console.log('SOURCE', source);

  const destination = path.join(CURR_DIR, projectRoot);
  console.log('Desrination', destination);

  try {
    await fse.copy(source, destination);
    console.log('Template copied');
    const shellProcess = spawn(userShell, [
      '-c',
      `mkdir ${destination}/programs && mv ${destination}/test/sample_program.test.ts ${destination}/test/${leoProjectName}.test.ts `
    ]);
    shellProcess.stdout.on('data', (data) => {
      console.log(data.toString());
    });

    shellProcess.stderr.on('data', (data) => {
      console.log(data.toString());
    });

    console.log(`Project structure for ${projectName} created.`);
  } catch (err: any) {
    console.error(err);
  }
}

export { createProjectStructure, generateProgram };
