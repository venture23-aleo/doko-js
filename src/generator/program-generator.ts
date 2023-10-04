import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import readline from 'readline';

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

function createProjectStructure(projectName: string, programName: string) {
  const projectRoot = projectName; // Use the provided project name
  const leoProjectName = toSnakeCase(programName);

  // Define the folder and file structure
  const structure = [
    'README.md',
    'scripts/deploy.ts',
    `test/${leoProjectName}.test.ts`,
    '.env.example',
    'programs/',
    'package-lock.json',
    'tsconfig.json'
  ];

  // Create the folder and file structure
  structure.forEach((item) => {
    const itemPath = path.join(projectRoot, item);

    const isDirectory = item.endsWith('/');

    if (isDirectory) {
      // Create a directory if it doesn't exist
      if (!fs.existsSync(itemPath)) {
        fs.mkdirSync(itemPath, { recursive: true });
      }
    } else {
      // Create an empty file if it doesn't exist
      if (!fs.existsSync(itemPath)) {
        // Ensure that the parent directory exists
        const parentDir = path.dirname(itemPath);
        if (!fs.existsSync(parentDir)) {
          fs.mkdirSync(parentDir, { recursive: true });
        }
        fs.writeFileSync(itemPath, '');
      }
    }
  });

  console.log(`Project structure for ${projectName} created.`);
}

export { createProjectStructure, generateProgram };
