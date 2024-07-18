import fs from 'fs-extra';
import path from 'path';
import os from 'os';

import {
  getAleoConfig,
  getFilenamesInDirectory,
  getProjectRoot,
  toSnakeCase,
  Shell
} from '@doko-js/utils';
import { Node, NodeImport, sort } from '@/utils/graph';
import { promisify } from 'util';
import { exec } from 'child_process';

const GENERATE_FILE_OUT_DIR = 'artifacts';
const LEO_ARTIFACTS = `${GENERATE_FILE_OUT_DIR}/leo`;
const ALEO_DEPS_REGISTRY = `${GENERATE_FILE_OUT_DIR}/aleo/registry`;
const JS_ARTIFACTS = `${GENERATE_FILE_OUT_DIR}/js`;
const PROGRAM_DIRECTORY = './programs/';
const IMPORTS_DIRECTORY = './imports/';

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

function replacePrivateKeyInFile(envFile: string, privateKey: string) {
  const envData = fs.readFileSync(envFile, 'utf-8').trim();

  let envVariables = envData.split('\n');
  envVariables = envVariables.map((variable) => {
    const [key] = variable.split('=');
    if (key === 'PRIVATE_KEY') return key + '=' + privateKey;
    else return variable;
  });
  fs.writeFileSync(envFile, envVariables.join('\n'));
}

async function resolveImport(importName: string): Promise<NodeImport> {
  const nameWithoutExtension = importName.replace('.aleo', '');
  const programsPath = path.join(
    PROGRAM_DIRECTORY,
    `${nameWithoutExtension}.leo`
  );
  const importsPath = path.join(
    IMPORTS_DIRECTORY,
    `${nameWithoutExtension}.aleo`
  );
  const [isInPrograms, isInImports] = await Promise.all([
    fs.exists(programsPath),
    fs.exists(importsPath)
  ]);

  async function checkIsFile(fileName: string) {
    const stat = await fs.lstat(fileName);

    if (!stat.isFile()) {
      throw new Error(`${fileName} is not a file`);
    }
  }

  if (isInImports && isInPrograms) {
    throw new Error(
      `Program '${nameWithoutExtension}.aleo' found in 'imports' and 'programs' directories`
    );
  }

  if (!isInImports && !isInPrograms) {
    throw new Error(
      `Program '${nameWithoutExtension}.aleo' not found in 'imports' nor 'programs' directories`
    );
  }

  if (isInImports) {
    await checkIsFile(importsPath);
    return {
      source: 'imports',
      name: `${nameWithoutExtension}.aleo`
    };
  }

  await checkIsFile(programsPath);
  return {
    source: 'programs',
    name: `${nameWithoutExtension}.leo`
  };
}

async function createGraph(
  programs: Array<string>,
  programPath: string
): Promise<Node[]> {
  const nodePromises = programs.map(async (programName) => {
    const imports = await getFileImports(`${programPath}/${programName}`);

    const node: Node = {
      name: programName,
      inputs: await Promise.all(
        imports.map((importName) => resolveImport(importName))
      )
    };
    return node;
  });

  const nodes = Promise.all(nodePromises);
  return nodes;
}

async function prepareImportsRegistry(importsDir: string, registryDir: string) {
  const aleoConfig = await getAleoConfig();
  const defaultNetwork = aleoConfig['defaultNetwork'];

  const registryDirWithNetwork = path.join(registryDir, defaultNetwork);
  const srcFiles = path.join(importsDir, '*.aleo');

  const importDirExists = await fs.exists(importsDir);
  if (!importDirExists) return;

  const files = fs.readdirSync(importsDir);
  const importFileExists =
    files.filter((file) => file.endsWith('.aleo')).length > 0;
  if (!importFileExists) return;

  const cpCommand = `mkdir -p ${registryDirWithNetwork} && cp ${srcFiles} ${registryDirWithNetwork}`;

  const cpShellCommand = new Shell(cpCommand);
  return cpShellCommand.asyncExec();
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

  const importConfigs = await Promise.all(
    fileImports.map(async (fileImport) => {
      const config: Record<string, string> = {};
      config.name = fileImport;
      const resolvedDependency = await resolveImport(fileImport);
      switch (executionMode) {
        case 'evaluate':
          if (resolvedDependency.source === 'programs') {
            config.location = 'local';
            config.path = path.relative(
              programDir,
              `${artifactDir}/${fileImport.split('.aleo')[0]}`
            );
          } else {
            config.location = 'network';
            config.network = defaultNetwork;
          }
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
    })
  );
  return importConfigs;
}

// Only cache the program in network mode
async function cachePrograms(
  programName: string,
  programDir: string,
  networkName: string,
  registryDir?: string
) {
  const homeDir = os.homedir();
  const srcFilePath = `${programDir}/build/main.aleo`;
  const dstFolder = registryDir || `${homeDir}/.aleo/registry/${networkName}`;
  const dstFilePath = `${dstFolder}/${programName}.aleo`;

  const createLeoCommand = `mkdir -p "${dstFolder}" && cp "${srcFilePath}" "${dstFilePath}"`;
  const leoShellCommand = new Shell(createLeoCommand);
  return leoShellCommand.asyncExec();
}

async function getLeoVersion(): Promise<string> {
  const execute = promisify(exec);
  const cmd = 'leo -V';
  const { stdout } = await execute(cmd);
  const searchResult = /leo (?<version>\d+\.\d+\.\d+)/.exec(stdout);
  return searchResult?.groups?.version || '';
}

async function buildProgram(programName: string, leoVersion: string) {
  const parsedProgramName = toSnakeCase(programName);
  const projectRoot = getProjectRoot();
  const artifactDir = `${projectRoot}/${LEO_ARTIFACTS}`;
  const programDir = `${artifactDir}/${parsedProgramName}`;
  const registryDir = path.normalize(
    path.join(projectRoot, ALEO_DEPS_REGISTRY)
  );
  const leoHomeDir = path.normalize(path.join(registryDir, '..'));

  const createLeoCommand = `mkdir -p "${artifactDir}" && cd "${artifactDir}" && leo new ${parsedProgramName} && rm "${programDir}/src/main.leo" && cp "${projectRoot}/programs/${parsedProgramName}.leo" "${programDir}/src/main.leo"`;
  const leoShellCommand = new Shell(createLeoCommand);
  await leoShellCommand.asyncExec();

  // Update import dependencies on program.json
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

  // Update private key on environment
  const aleoConfig = await getAleoConfig();
  const defaultNetwork = aleoConfig['defaultNetwork'];
  if (defaultNetwork) {
    const networkConfig = aleoConfig.networks[defaultNetwork];
    if (networkConfig?.accounts && networkConfig.accounts.length > 0) {
      const privateKey = networkConfig.accounts[0];
      if (!privateKey)
        throw new Error('Invalid private key, check aleo-config.js ...');
      replacePrivateKeyInFile(`${programDir}/.env`, privateKey);
    }
  }

  const networkFlag =
    defaultNetwork && leoVersion.startsWith('2.')
      ? `--network ${defaultNetwork}`
      : '';

  const leoBuildCommand = `cd "${programDir}" && leo build --home ${leoHomeDir} ${networkFlag}`;
  const shellCommand = new Shell(leoBuildCommand);
  const res = await shellCommand.asyncExec();

  if (aleoConfig['mode'] === 'execute' && defaultNetwork) {
    await cachePrograms(programName, programDir, defaultNetwork);
    await cachePrograms(
      programName,
      programDir,
      defaultNetwork,
      path.join(registryDir, defaultNetwork)
    );
    console.log(`Program ${programName}.aleo cached to aleo registry`);
  }

  return res;
}

async function buildPrograms() {
  try {
    const directoryPath = getProjectRoot();
    const programsPath = path.join(directoryPath, 'programs');
    const importsPath = path.join(directoryPath, IMPORTS_DIRECTORY);
    let names = getFilenamesInDirectory(programsPath).sort();
    await prepareImportsRegistry(importsPath, ALEO_DEPS_REGISTRY);
    const leoVersion = await getLeoVersion();

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
        await buildProgram(programName, leoVersion);
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
