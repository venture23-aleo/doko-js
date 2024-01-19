import fs from 'fs-extra';
import path from 'path';
import os from 'os';

import {
  getAleoConfig,
  getFilenamesInDirectory,
  getProjectRoot
} from '@/utils/fs-utils';
import Shell from '@/utils/shell';
import { Node, sort } from '@/utils/graph';
import { toSnakeCase } from '@/utils/formatters';

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

async function createGraph(
  programs: Array<string>,
  programPath: string
): Promise<Node[]> {
  const nodePromises = programs.map(async (programName) => {
    const imports = await getFileImports(`${programPath}/${programName}`);

    const node: Node = {
      name: programName,
      inputs: imports.map((importName) => importName.replace('.aleo', '.leo'))
    };
    return node;
  });

  const nodes = Promise.all(nodePromises);
  return nodes;
}

async function createImportConfig(
  programDir: string,
  artifactDir: string,
  fileImports: string[]
) {
  // We handle the import dependencies with the program.json
  const aleoConfig = await getAleoConfig();
  const executionMode = aleoConfig['mode'];
  const defaultNetwork = aleoConfig['defaultNetwork'];
  const networkConfig = aleoConfig.networks[defaultNetwork];

  const importConfigs = fileImports.map((fileImport) => {
    const config: Record<string, string> = {};
    config.name = fileImport;
    switch (executionMode) {
      case 'evaluate':
        config.location = 'local';
        config.path = path.relative(
          programDir,
          `${artifactDir}/${fileImport.split('.aleo')[0]}`
        );
        break;
      case 'execute':
        config.location = 'network';
        config.endpoint = networkConfig.endpoint || '';
        config.network = defaultNetwork;
        break;
      default:
        throw new Error(`Unrecognized execution mode ${executionMode}`);
    }
    return config;
  });
  return importConfigs;
}

// Only cache the program in network mode
async function cachePrograms(
  programName: string,
  programDir: string,
  networkName: string
) {
  const homeDir = os.homedir();
  const srcFilePath = `${programDir}/build/main.aleo`;
  const dstFolder = `${homeDir}/.aleo/registry/${networkName}`;
  const dstFilePath = `${dstFolder}/${programName}.aleo`;

  const createLeoCommand = `mkdir -p "${dstFolder}" && cp "${srcFilePath}" "${dstFilePath}"`;
  const leoShellCommand = new Shell(createLeoCommand);
  return leoShellCommand.asyncExec();
}

async function buildProgram(programName: string) {
  const parsedProgramName = toSnakeCase(programName);
  const projectRoot = getProjectRoot();
  const artifactDir = `${projectRoot}/${LEO_ARTIFACTS}`;
  const programDir = `${artifactDir}/${parsedProgramName}`;

  const createLeoCommand = `mkdir -p "${artifactDir}" && cd "${artifactDir}" && leo new ${parsedProgramName} && rm "${programDir}/src/main.leo" && cp "${projectRoot}/programs/${parsedProgramName}.leo" "${programDir}/src/main.leo"`;
  const leoShellCommand = new Shell(createLeoCommand);
  await leoShellCommand.asyncExec();

  const fileImports = await getFileImports(
    `${projectRoot}/programs/${programName}.leo`
  );
  if (fileImports.length) {
    fileImports.sort();
    const configFilePath = `${programDir}/program.json`;
    const configs = JSON.parse(fs.readFileSync(configFilePath, 'utf-8'));
    configs.dependencies = await createImportConfig(
      programDir,
      artifactDir,
      fileImports
    );
    fs.writeFileSync(configFilePath, JSON.stringify(configs));
  }

  const leoRunCommand = `cd "${programDir}" && leo run`;
  const shellCommand = new Shell(leoRunCommand);
  const res = await shellCommand.asyncExec();

  const aleoConfig = await getAleoConfig();
  if (aleoConfig['mode'] === 'execute') {
    await cachePrograms(programName, programDir, aleoConfig['defaultNetwork']);
    console.log(`Program ${programName}.aleo cached to aleo registry`);
  }

  return res;
}

async function buildPrograms() {
  try {
    const directoryPath = getProjectRoot();
    const programsPath = path.join(directoryPath, 'programs');
    let names = getFilenamesInDirectory(programsPath).sort();

    const leoArtifactsPath = path.join(directoryPath, LEO_ARTIFACTS);
    console.log('Cleaning up old files');
    await fs.rm(leoArtifactsPath, { recursive: true, force: true });
    console.log('Compiling new files');

    const graph = await createGraph(names, programsPath);
    if (graph.length === 0) return;

    const sortedNodes = sort(graph);
    if (!sortedNodes) return;

    names = sortedNodes.map((node) => node.name);
    console.log(names);

    try {
      for (const name of names) {
        const programName = name.split('.')[0];
        await buildProgram(programName);
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
