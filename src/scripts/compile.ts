import fs from 'fs-extra';
import path from 'path';

import { getFilenamesInDirectory, getProjectRoot } from '../utils/fs-utils';
import { toSnakeCase } from '../utils/formatters';
import Shell from '../utils/shell';
import { Node, sort } from '../utils/graph';

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

async function createGraph(programs: Array<string>, programPath: string): Promise<Node[]> {
  const nodePromises = programs.map(async (programName) => {
    const imports = await getFileImports(
      `${programPath}/${programName}`
    );

    const node: Node = {
      name: programName,
      inputs: imports.map(importName => importName.replace('.aleo', '.leo'))
    }
    return node;
  });

  const nodes = Promise.all(nodePromises);
  return nodes;
}


async function buildProgram(programName: string) {
  const parsedProgramName = toSnakeCase(programName);
  const projectRoot = getProjectRoot();
  const createLeoCommand = `mkdir -p "${projectRoot}/${LEO_ARTIFACTS}" && cd "${projectRoot}/${LEO_ARTIFACTS}" && leo new ${parsedProgramName} && rm "${projectRoot}/${LEO_ARTIFACTS}/${parsedProgramName}/src/main.leo" && cp "${projectRoot}/programs/${parsedProgramName}.leo" "${projectRoot}/${LEO_ARTIFACTS}/${parsedProgramName}/src/main.leo"`;
  const leoShellCommand = new Shell(createLeoCommand);
  const res = await leoShellCommand.asyncExec();

  let fileImports = await getFileImports(
    `${projectRoot}/programs/${programName}.leo`
  );
  if (fileImports.length) {
    // We handle the import dependencies with the program.json  
    const artifactDir = `${projectRoot}/${LEO_ARTIFACTS}`;
    const configFilePath = `${artifactDir}/${parsedProgramName}/program.json`
    let executionMode = 'evaluate';
    const configs = JSON.parse(fs.readFileSync(configFilePath, 'utf-8'));
    const location = 'local';

    // @TODO Check if program directory exists or not in evaluate mode
    const dependencies = fileImports.map(fileImport => ({
      name: fileImport,
      location,
      path: `${artifactDir}/${fileImport.split('.aleo')[0]}`,
    }));
    configs.dependencies = dependencies;
    fs.writeFileSync(configFilePath, JSON.stringify(configs));
  }

  const leoRunCommand = `cd "${projectRoot}/${LEO_ARTIFACTS}/${parsedProgramName}" && leo run`;
  const shellCommand = new Shell(leoRunCommand);
  return shellCommand.asyncExec();
}

async function buildPrograms() {
  try {
    const directoryPath = getProjectRoot();
    const programsPath = path.join(directoryPath, 'programs');
    let names = getFilenamesInDirectory(programsPath);

    const leoArtifactsPath = path.join(directoryPath, LEO_ARTIFACTS);
    console.log('Cleaning up old files');
    await fs.rm(leoArtifactsPath, { recursive: true, force: true });
    console.log('Compiling new files');
    /*
    const buildPromises = names.map(async (name) => {
      const programName = name.split('.')[0];
      buildProgram(programName);
    });
    */
    const graph = await createGraph(names, programsPath);
    if (graph.length === 0) return;

    const sortedNodes = sort(graph);
    if (!sortedNodes) return;
    names = sortedNodes.map(node => node.name);
    console.log(names);

    try {
      for (let name of names) {
        const programName = name.split('.')[0];
        await buildProgram(programName)
      }
      //try {
      //  const buildResults = await Promise.all(buildPromises);
      //  return { status: 'success', result: buildResults };
    } catch (e: any) {
      console.error(`\x1b[31; 1; 31m${e} \x1b[0m`);
      process.exit(1);
    }
  } catch (err) {
    console.error('Error:', err);

    return { status: 'error', err };
  }
}

export { buildPrograms };
