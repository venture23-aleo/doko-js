import fs from 'fs-extra';
import path from 'path';

import { getFilenamesInDirectory, getProjectRoot } from '../utils/fs-utils';
import { toSnakeCase } from '../utils/formatters';
import Shell from '../utils/shell';

const GENERATE_FILE_OUT_DIR = 'artifacts';
const LEO_ARTIFACTS = `${GENERATE_FILE_OUT_DIR}/leo`;
const JS_ARTIFACTS = `${GENERATE_FILE_OUT_DIR}/js`;
const PROGRAM_DIRECTORY = './programs/';

async function getFileImports(filePath: string) {
  const code = fs.readFileSync(filePath, 'utf-8');

  const regex = /import\s+([\w.]+);/g;
  const matches = [];
  let match;

  while ((match = regex.exec(code)) !== null) {
    matches.push(match[1]);
  }

  return matches;
}

async function buildProgram(programName: string) {
  const parsedProgramName = toSnakeCase(programName);
  const projectRoot = getProjectRoot();
  const fileImports = await getFileImports(
    `${projectRoot}/programs/${programName}.leo`
  );
  const createLeoCommand = `mkdir -p "${projectRoot}/${LEO_ARTIFACTS}" && cd "${projectRoot}/${LEO_ARTIFACTS}" && leo new ${parsedProgramName} && rm "${projectRoot}/${LEO_ARTIFACTS}/${parsedProgramName}/src/main.leo" && cp "${projectRoot}/programs/${parsedProgramName}.leo" "${projectRoot}/${LEO_ARTIFACTS}/${parsedProgramName}/src/main.leo"`;
  const leoShellCommand = new Shell(createLeoCommand);
  const res = await leoShellCommand.asyncExec();

  if (fileImports.length) {
    const copyImportsPath = fileImports.map(
      (fileImport) => `"${projectRoot}/programs/${fileImport}"`
    );

    const createimports = `mkdir "${projectRoot}/${LEO_ARTIFACTS}/${programName}/imports" && cp ${copyImportsPath.join(
      ' '
    )} "${projectRoot}/${LEO_ARTIFACTS}/${parsedProgramName}/imports"`;
    console.log(createimports);
    const importShellCommand = new Shell(createimports);
    await importShellCommand.asyncExec();
  }

  const leoRunCommand = `cd "${projectRoot}/${LEO_ARTIFACTS}/${parsedProgramName}" && leo run`;
  const shellCommand = new Shell(leoRunCommand);
  return shellCommand.asyncExec();
}

async function buildPrograms() {
  try {
    const directoryPath = getProjectRoot();
    const programsPath = path.join(directoryPath, 'programs');
    const names = getFilenamesInDirectory(programsPath);
    console.log(names);

    const leoArtifactsPath = path.join(directoryPath, LEO_ARTIFACTS);
    console.log('Cleaning up old files');
    await fs.rm(leoArtifactsPath, { recursive: true, force: true });
    console.log('Compiling new files');
    const buildPromises = names.map(async (name) => {
      const programName = name.split('.')[0];
      return buildProgram(programName);
    });

    try {
      const buildResults = await Promise.all(buildPromises);
      return { status: 'success', result: buildResults };
    } catch (e: any) {
      console.error(`\x1b[31;1;31m${e}\x1b[0m`);
      process.exit(1);
    }
  } catch (err) {
    console.error('Error:', err);

    return { status: 'error', err };
  }
}

export { buildPrograms };
