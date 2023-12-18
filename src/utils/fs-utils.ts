import fs from 'fs';
import path from 'path';

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
    console.error('Aleo project initialization not found');
    process.exit(1);
  }
}

async function writeToFile(filename: string, data: string) {
  try {
    const fileStream = fs.createWriteStream(filename, 'utf-8');
    fileStream.write(data);
    fileStream.close();
    return new Promise((resolve, reject) => {
      fileStream.on('error', reject);
      fileStream.on('finish', () => {
        console.log('Generated file: ', filename);
      });
      fileStream.on('close', resolve);
    });
  } catch (error) {
    console.log(error);
  }
}

function getAleoConfig() {
  const configPath = path.join(getProjectRoot(), 'aleo-config.js');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const config = require(configPath);

  return config;
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
