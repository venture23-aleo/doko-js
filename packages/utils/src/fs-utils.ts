import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { isWindows } from './shell';
import { DokoJSError, DokoJSLogger, ERRORS } from './logger/logger';

function findRootDirectory(startingDir: string) {
  let currentDir = startingDir;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const packageJsonPath = path.join(currentDir, 'package.json');
    const aleoConfigPath = path.join(currentDir, 'aleo-config.js');

    if (fs.existsSync(packageJsonPath) && fs.existsSync(aleoConfigPath)) {
      return currentDir;
    }

    const parentDir = path.resolve(currentDir, '..');

    if (parentDir === currentDir) {
      return null; // Reached the root directory without finding both files
    }

    currentDir = parentDir;
  }
}

function getProjectRoot() {
  const startingDirectory = process.cwd();
  const npmRootDir = findRootDirectory(startingDirectory);

  if (npmRootDir) {
    return npmRootDir;
  } else {
    throw new DokoJSError(ERRORS.GENERAL.NOT_INSIDE_PROJECT);
  }
}

async function writeToFile(filename: string, data: string) {
  try {
    const folder = path.dirname(filename);
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

    const fileStream = fs.createWriteStream(filename, 'utf-8');
    fileStream.write(data);
    fileStream.close();
    return new Promise((resolve, reject) => {
      fileStream.on('error', reject);
      fileStream.on('finish', () => {
        DokoJSLogger.log('Generated file: ', filename);
      });
      fileStream.on('close', resolve);
    });
  } catch (error) {
    DokoJSLogger.error(error);
  }
}

let cachedConfig: any = null;

async function getAleoConfig() {
  if (cachedConfig) return cachedConfig.default;
  const configPath = path.join(getProjectRoot(), 'aleo-config.js');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const config = await import(pathToFileURL(configPath).toString());
  cachedConfig = config;

  // const config = require(configPath);

  return config.default;
}

function pathFromRoot(repoPath: string) {
  const projectRoot = getProjectRoot();

  return path.join(projectRoot, repoPath);
}

function getFilenamesInDirectory(directoryPath: string) {
  return fs.readdirSync(directoryPath, null).filter((file: string) => {
    return fs.statSync(path.join(directoryPath, file)).isFile();
  });
}

export {
  getProjectRoot,
  writeToFile,
  getAleoConfig,
  pathFromRoot,
  getFilenamesInDirectory
};
