import path from 'path';
import fse from 'fs-extra';

import {
  getProjectRoot,
  toSnakeCase,
  Shell,
  DokoJSLogger
} from '@doko-js/utils';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function replaceProgramName(
  filePath: string,
  newProgramName: string,
  oldName = 'temp_sample_program'
) {
  try {
    // Read the contents of the file
    let fileContent = await fse.readFile(filePath, 'utf8');

    // Replace 'temp_sample_program' with the new program name using a regular expression
    const regex = new RegExp(oldName, 'g');
    DokoJSLogger.debug(fileContent);
    fileContent = fileContent.replace(regex, newProgramName);

    // Write the modified content back to the file
    await fse.writeFile(filePath, fileContent, 'utf8');

    DokoJSLogger.debug(
      `Program name replaced with ${newProgramName} in ${filePath}`
    );
  } catch (error: any) {
    DokoJSLogger.error(`Error reading or writing the file: ${error.message}`);
  }
}

async function addProgram(
  programName: string,
  rootDestination?: string | undefined
) {
  const parsedProgramName = toSnakeCase(programName);
  const projectRoot = rootDestination || getProjectRoot();

  const templatesDir = path.join(__dirname, 'template');
  const source = path.join(templatesDir, '');

  const baseCommand = rootDestination ? fse.rename : fse.copyFile;

  const destPath = path.join(
    projectRoot,
    'programs',
    `${parsedProgramName}.leo`
  );

  const pathToCopy = rootDestination
    ? path.join(projectRoot, 'programs/temp_sample_program.leo')
    : path.join(source, 'programs/temp_sample_program.leo');
  const testPathToCopy = rootDestination
    ? path.join(projectRoot, 'test/sample_program.test.ts')
    : path.join(source, 'test/sample_program.test.ts');
  const testDestPath = path.join(
    projectRoot,
    'test',
    `${parsedProgramName}.test.ts`
  );

  try {
    await baseCommand(pathToCopy, destPath);
    await baseCommand(testPathToCopy, testDestPath);

    await replaceProgramName(destPath, parsedProgramName);
    await replaceProgramName(testDestPath, parsedProgramName, 'sample_program');

    return 'success';
  } catch (err) {
    DokoJSLogger.error(err);
    return 'error';
  }
}

async function createProjectStructure(
  projectName: string,
  programName: string
): Promise<{ status: string; destination: string } | undefined> {
  const projectRoot = projectName; // Use the provided project name
  const leoProjectName = toSnakeCase(programName);

  const CURR_DIR = process.cwd();
  const templatesDir = path.join(__dirname, 'template');
  const source = path.join(templatesDir, '');
  let destination = path.join(CURR_DIR, projectRoot);

  try {
    await fse.copy(source, destination);
    destination = destination.replace(/\\(?! )/g, '/');

    DokoJSLogger.debug(`Template copied to: ${destination}`);

    await fse.mkdir(`${destination}/programs`, { recursive: true });
    await fse.rename(`${destination}/env`, `${destination}/.env`);
    await fse.rename(`${destination}/gitignore`, `${destination}/.gitignore`);
    DokoJSLogger.info('Project structure initialized');

    return {
      status: 'success',
      destination
    };
  } catch (err: any) {
    DokoJSLogger.error(err);
  }
}

async function installNpmPackages(path: string | undefined) {
  DokoJSLogger.info('Installing repo dependencies ...');
  const devDeps = [
    '@types/jest',
    'jest',
    'ts-jest@29.1.1',
    'babel-jest',
    '@babel/preset-env'
  ];
  const dependencies = [
    'zod',
    '@provablehq/sdk',
    'dotenv',
    '@doko-js/core',
    '@doko-js/utils',
    '@doko-js/wasm'
  ];
  const command = `cd "${path}" && npm install --save-dev ${devDeps.join(
    ' '
  )} --no-warnings && npm install ${dependencies.join(' ')} --no-warnings`;

  const shell = new Shell(command);
  return shell.asyncExec();
}

async function initializeGit(path: string | undefined) {
  DokoJSLogger.info('Initializing git');
  const command = `cd "${path}" && git init -b main`;

  const shell = new Shell(command);
  return shell.asyncExec();
}

export {
  createProjectStructure,
  addProgram,
  installNpmPackages,
  initializeGit
};
