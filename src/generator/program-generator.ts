import path from 'path';
import fse from 'fs-extra';

import { getProjectRoot } from '../utils/fs-utils';
import { toSnakeCase } from '../utils/formatters';

async function replaceProgramName(filePath: string, newProgramName: string) {
  try {
    // Read the contents of the file
    let fileContent = await fse.readFile(filePath, 'utf8');

    // Replace 'temp_sample_program' with the new program name using a regular expression
    const regex = new RegExp('temp_sample_program', 'g');
    console.log(fileContent);
    fileContent = fileContent.replace(regex, newProgramName);
    console.log(fileContent);
    // Write the modified content back to the file
    await fse.writeFile(filePath, fileContent, 'utf8');

    console.log(`Program name replaced with ${newProgramName} in ${filePath}`);
  } catch (error: any) {
    console.error(`Error reading or writing the file: ${error.message}`);
  }
}

async function addProgram(
  programName: string,
  rootDestination?: string | undefined
) {
  const parsedProgramName = toSnakeCase(programName);
  const projectRoot = rootDestination || getProjectRoot();

  const templatesDir = path.join(__dirname, '../template');
  const source = path.join(templatesDir, '');

  const baseCommand = rootDestination ? fse.rename : fse.copyFile;
  const pathToCopy = rootDestination
    ? `${source}/programs/temp_sample_program.leo`
    : path.join(source, 'programs/temp_sample_program.leo');
  const destPath = path.join(
    projectRoot,
    'programs',
    `${parsedProgramName}.leo`
  );

  const testPathToCopy = rootDestination
    ? `${source}/test/sample_program.test.ts`
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

    return 'success';
  } catch (err) {
    console.error('Error:', err);
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
  const templatesDir = path.join(__dirname, '../template');
  const source = path.join(templatesDir, '');
  let destination = path.join(CURR_DIR, projectRoot);

  try {
    await fse.copy(source, destination);
    destination = destination.replace(/\\/g, '/');
    console.log(destination);
    console.log('Template copied');
    await fse.mkdir(`${destination}/programs`, { recursive: true });

    return {
      status: 'success',
      destination
    };
  } catch (err: any) {
    console.error(err);
  }
}

export { createProjectStructure, addProgram };
