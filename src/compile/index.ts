import fs from 'fs-extra';
import path from 'path';
import readline from 'readline';
import { spawn } from 'child_process';

import { getProjectRoot } from '../utils/fs-utils';
import { getUserShell } from '../utils/requirementsCheck';
import { toSnakeCase } from '../utils/formatters';

const GENERATE_FILE_OUT_DIR = 'artifacts/';
const LEO_ARTIFACTS = `${GENERATE_FILE_OUT_DIR}/leo`;
const JS_ARTIFACTS = `${GENERATE_FILE_OUT_DIR}/js`;
const PROGRAM_DIRECTORY = './programs/';

const userShell = getUserShell();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function buildProgram(programName: string) {
  const parsedProgramName = toSnakeCase(programName);
  const projectRoot = getProjectRoot();
  let command = `mkdir -p ${projectRoot}/${LEO_ARTIFACTS} && cd ${projectRoot}/${LEO_ARTIFACTS} && leo new ${parsedProgramName} && rm ${projectRoot}/${LEO_ARTIFACTS}/${parsedProgramName}/src/main.leo && cp ${projectRoot}/programs/${parsedProgramName}.leo ${projectRoot}/${LEO_ARTIFACTS}/${parsedProgramName}/src/main.leo && cd ${projectRoot}/${LEO_ARTIFACTS}/${parsedProgramName} && leo run`;
  command = command.replace(/\\/g, '/');

  return new Promise((res, rej) => {
    const shellProcess = spawn(userShell, ['-c', command]);
    rl.on('line', (input) => {
      shellProcess.stdin.write(input + '\n');
    });

    shellProcess.stdout.on('data', (data) => {
      console.log(data.toString());
    });

    shellProcess.stderr.on('data', (data) => {
      console.log(data.toString());
    });

    shellProcess.on('close', (code) => {
      res(code);
      rl.close();
    });
  });
}

function getFilenamesInDirectory(directoryPath: string) {
  return fs.readdir(directoryPath).then((files) => {
    const filenames = files.filter((file) =>
      fs.statSync(path.join(directoryPath, file)).isFile()
    );
    return filenames;
  });
}

async function compileAndBuildPrograms() {
  try {
    const directoryPath = getProjectRoot();
    const programsPath = path.join(directoryPath, 'programs');
    const names = await getFilenamesInDirectory(programsPath);
    const leoArtifactsPath = path.join(directoryPath, LEO_ARTIFACTS);
    console.log('Cleaning up old files');
    await fs.rm(leoArtifactsPath, { recursive: true, force: true });
    console.log('Compiling new files');
    const buildPromises = names.map(async (name) => {
      const programName = name.split('.')[0];
      return buildProgram(programName);
    });

    const buildResults = await Promise.all(buildPromises);

    return { status: 'success', result: buildResults };
  } catch (err) {
    console.error('Error:', err);

    return { status: 'error', err };
  }
}

export { compileAndBuildPrograms };
