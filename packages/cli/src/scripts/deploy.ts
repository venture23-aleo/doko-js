import path from 'path';
import fse from 'fs-extra';

import { Shell, getAleoConfig, getProjectRoot } from '@doko-js/utils';

function createProgramPath(programName: string) {
  const projectRoot = getProjectRoot();
  const programPath = path.join(
    projectRoot,
    'artifacts/leo/',
    programName,
    'build/main.aleo'
  );

  return programPath;
}

function getBuildPath(programName: string) {
  const projectRoot = getProjectRoot();
  const buildPath = path.join(
    projectRoot,
    'artifacts/leo/',
    programName,
    'build/'
  );

  return buildPath;
}

function programExists(programName: string) {
  const programPath = createProgramPath(programName);

  return fse.existsSync(programPath);
}

async function deploy(
  programName: string,
  { privateKeyIndex = 0, network = 'testnet' }
) {
  const isExist = programExists(programName);

  if (!isExist) {
    console.error(`Program file for ${programName} not found`);
    process.exit(1);
  }
  const config = await getAleoConfig();
  const appName = programName;
  const networkConfig = config.networks[network];
  const privateKey = networkConfig.accounts[privateKeyIndex];
  const nodeEndPoint = networkConfig.endpoint;
  const deployPath = getBuildPath(programName);
  const priorityFee = 0;
  const command = `snarkos developer deploy "${appName}.aleo" --private-key "${privateKey}" --query ${nodeEndPoint} --network ${config.networkMode} --path ${deployPath} --broadcast "${nodeEndPoint}/${config.networkName}/transaction/broadcast" --priority-fee ${priorityFee}`;

  const userShell = new Shell(command);

  return userShell.asyncExec();
}

export { deploy };
