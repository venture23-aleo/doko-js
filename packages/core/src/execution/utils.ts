import { get, post } from '@/utils/httpRequests';
import { ContractConfig } from './types';
import { TransactionModel } from '@provablehq/sdk';
import { execute } from './execution-helper';
import {
  SnarkDeployResponse,
  TransactionResponse
} from '@/leo-types/transaction';
import { DokoJSError, DokoJSLogger, ERRORS } from '@doko-js/utils';
import fs from 'fs-extra';
import path, { join } from 'path';
import { tmpdir } from 'os';

// @TODO Fix this
const ALEO_REGISTRY_DIR = 'artifacts/aleo';

// Convert json like string to json
export function parseJSONLikeString(
  recordString: string
): Record<string, unknown> {
  const json = recordString.replace(/(['"])?([a-z0-9A-Z_.]+)(['"])?/g, '"$2" ');
  const correctJson = json;
  return JSON.parse(correctJson);
}

export const zkGetMapping = async (
  config: ContractConfig,
  mappingName: string,
  key: string
): Promise<any> => {
  if (!config) return null;
  if (!config.network) {
    throw new DokoJSError(ERRORS.VARS.VALUE_NOT_FOUND_FOR_VAR, {
      value: 'network'
    });
  }
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const url = `${config.network.endpoint}/${config.networkName}/program/${config.appName}.aleo/mapping/${mappingName}/${key}`;
  DokoJSLogger.debug(url);

  try {
    const response = await fetch(url);
    let data = await response.json();
    if (data == null) {
      return null;
    }
    data = (data as string).replace(/(['"])?([a-z0-9A-Z_.]+)(['"])?/g, '"$2" ');
    return JSON.parse(data as string);
  } catch (err) {
    DokoJSLogger.error(err);
  }
};

export const checkDeployment = async (
  endpoint: string
): Promise<boolean | undefined> => {
  DokoJSLogger.info(`Checking deployment: ${endpoint}`);

  let response: Response;
  try {
    response = await get(endpoint);
  } catch (networkErr: any) {
    try {
      const networkErrorMessage = JSON.parse(networkErr.message);
      response = networkErrorMessage;
      if (networkErrorMessage.statusCode == 404) {
        DokoJSLogger.info('Deployment not found (404)');
        return false;
      }
    } catch (e: any) {
      response = networkErr;
      if (networkErr?.message?.includes('Missing program for ID')) {
        DokoJSLogger.info('Deployment not found');
        return false;
      }
    }

    // if the program isn't there, backend now returns a 404 + JSON
  }
  if (response.status === 404) {
    let body: any;
    try {
      body = await response.json();
    } catch {
      // fallback if JSON parse fails
      DokoJSLogger.info('Deployment not found (404)');
      return false;
    }
    if (body.message === 'Program not found') {
      DokoJSLogger.info(`Deployment not found: ${body.message}`);
      return false;
    }
  }

  // any other non-2xx status is a failure
  if (!response.ok) {
    const text = await response.text();
    throw new DokoJSError(
      ERRORS.NETWORK.DEPLOYMENT_CHECK_FAIL,
      { endpoint, status: response.status },
      new Error(`Unexpected response: ${response.status} – ${text}`)
    );
  }

  // 2xx → deployed
  await response.json(); // or strip this if you don't need the payload
  return true;
};

export const broadcastTransaction = async (
  transaction: TransactionModel,
  endpoint: string,
  networkName: string
) => {
  try {
    return await post(`${endpoint}/${networkName}/transaction/broadcast`, {
      body: JSON.stringify(transaction),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (err) {
    DokoJSLogger.error(err);
  }
};

async function makeProjectForDeploy(
  programName: string,
  aleoCode: string,
  importsDir: string
): Promise<string> {
  const projectDir = await fs.mkdtemp(join(tmpdir(), 'dokojs-imports-'));
  // await fs.mkdirp(projectDir);

  const projectManifest = {
    program: programName,
    version: '0.0.0',
    description: '',
    license: 'MIT'
  };
  await fs.writeFile(
    join(projectDir, 'program.json'),
    JSON.stringify(projectManifest)
  );
  await fs.mkdir(join(projectDir, 'build'));
  await fs.writeFile(join(`${projectDir}/build`, 'main.aleo'), aleoCode);
  await fs.copy(importsDir, join(`${projectDir}/build`, 'imports'), {});
  await fs.copy(
    join(projectDir, 'program.json'),
    join(`${projectDir}/build`, 'program.json'),
    {}
  );

  return projectDir;
}
async function deployAleo(
  aleoCode: string,
  config: ContractConfig,
  aleoFilesDir: string
) {
  const nodeEndPoint = config['network']?.endpoint;

  if (!nodeEndPoint) {
    throw new Error('networkName missing in contract config for deployment');
  }

  const isProgramDeployed = await checkDeployment(
    `${nodeEndPoint}/${config.networkName}/program/${config.appName}.aleo`
  );

  if (isProgramDeployed) {
    throw new Error(`Program ${config.appName} is already deployed`);
  }

  DokoJSLogger.log(`Deploying program ${config.appName}`);

  const projectDir = await makeProjectForDeploy(
    `${config.appName}.aleo`,
    aleoCode,
    aleoFilesDir
  );
  const priorityFee = config.priorityFee || 0;

  // const cmd = `cd ${projectDir} && snarkos developer deploy "${config.appName}.aleo" --path . --priority-fee ${priorityFee}  --private-key ${config.privateKey} --query ${nodeEndPoint} --dry-run`;
  // const { stdout } = await execute(cmd);
  // const result = new SnarkStdoutResponseParser().parse(stdout);
  // await broadcastTransaction(
  //   result.transaction as TransactionModel,
  //   nodeEndPoint,
  //   config.networkName!
  // );
  // return new SnarkDeployResponse(
  //   result.transaction as TransactionModel,
  //   config
  // );
  const cmd = leoDeployCommand(
    projectDir,
    config.privateKey,
    nodeEndPoint,
    config.networkName,
    priorityFee,
    true
  );
  DokoJSLogger.debug(cmd);
  const { stdout } = await execute(cmd);
  const result = transactionHashToTransactionResponseObject(
    stdout.split('Deployment')[2].split(' ')[1],
    'deploy'
  );
  return new SnarkDeployResponse(result?.id || '', config);
}

const snarkDeployAleo = async ({
  config
}: {
  config: ContractConfig;
}): Promise<TransactionResponse<any>> => {
  const aleoCode = await fs.readFile(`${config.contractPath}.aleo`);
  const importsDir = path.normalize(path.join(config.contractPath, '..'));

  return deployAleo(aleoCode.toString('utf-8'), config, importsDir);
};

export const snarkDeploy = async ({
  config
}: {
  config: ContractConfig;
}): Promise<TransactionResponse<any>> => {
  if (config.isImportedAleo) {
    return snarkDeployAleo({ config });
  }

  const nodeEndPoint = config['network']?.endpoint;

  if (!nodeEndPoint) {
    throw new DokoJSError(ERRORS.VARS.VALUE_NOT_FOUND_FOR_VAR, {
      value: 'networkName'
    });
  }

  const priorityFee = config.priorityFee || 0;

  const isProgramDeployed = await checkDeployment(
    `${nodeEndPoint}/${config.networkName}/program/${config.appName}.aleo`
  );

  if (isProgramDeployed) {
    throw new DokoJSError(ERRORS.NETWORK.CONFLICTING_DEPLOYMENT, {
      programName: config.appName
    });
  }

  DokoJSLogger.info(`Deploying program ${config.appName}`);
  const programJson = await fs.readJSON(`${config.contractPath}/program.json`);
  if (programJson.dependencies) {
    const dependencies: any = [];
    for (const dependency of programJson.dependencies) {
      const isDeployed = await checkDeployment(
        `${nodeEndPoint}/${config.networkName}/program/${dependency.name}`
      );
      if (isDeployed) {
        dependency.location = 'network';
        dependency.endpoint = nodeEndPoint;
        dependency.network = config.networkName;
        dependency.path = undefined;
      } else {
        dependency.location = 'local';
        dependency.endpoint = undefined;
        dependency.network = undefined;
        dependency.path = `../../../imports/${dependency.name}`;
      }
      dependencies.push(dependency);
    }
    programJson.dependencies = dependencies;
    await fs.writeJSON(`${config.contractPath}/program.json`, programJson);
  }

  // const cmd = `cd ${config.contractPath}/build && leo deploy --priority-fee ${priorityFee}  --private-key ${config.privateKey} --endpoint ${nodeEndPoint} --network ${config.networkName}`;
  // const cmd = `cd ${config.contractPath} && leo deploy --priority-fee ${priorityFee}  --private-key ${config.privateKey} --endpoint ${nodeEndPoint} --network ${config.networkName} --yes`;
  const cmd = leoDeployCommand(
    config.contractPath,
    config.privateKey,
    nodeEndPoint,
    config.networkName,
    priorityFee
  );
  DokoJSLogger.debug(cmd);

  const { stdout } = await execute(cmd);
  const result = transactionHashToTransactionResponseObject(
    extractTransactionId(stdout)!,
    'deploy'
  );
  // const result = extractTransactionId(stdout);
  // // @TODO check it later
  // await broadcastTransaction(
  //   result as TransactionModel,
  //   nodeEndPoint,
  //   config.networkName!
  // );
  return new SnarkDeployResponse(result?.id || '', config);
};

export const leoDeployCommand = (
  path: string,
  privateKey: string,
  endpoint: string,
  network: string = 'testnet',
  priorityFee: number = 0,
  noBuild: boolean = false
) => {
  if (endpoint == 'http://localhost:3030') {
    return `cd ${path} && leo deploy --broadcast --private-key ${privateKey} --endpoint ${endpoint} --network ${network} --yes --twice --print`;
  }
  return `cd ${path} && leo deploy --broadcast --private-key ${privateKey} --endpoint ${endpoint} --network ${network} --yes --print`;
};

export const transactionHashToTransactionResponseObject = (
  transactionHash: string,
  type: 'deploy' | 'execute'
): TransactionModel | null => {
  const transaction = { id: transactionHash, type, execution: { edition: 1 } };
  return transaction;
};

export function extractTransactionId(output: string): string | null {
  const regex = /transaction ID:\s*['"]([^'"]+)['"]/i;
  const match = output.match(regex);
  return match ? match[1] : null;
}

export const validateBroadcast = async (
  transactionId: string,
  nodeEndpoint: string,
  networkName: string
): Promise<TransactionModel | null> => {
  const pollUrl = `${nodeEndpoint}/${networkName}/transaction/${transactionId}`;
  const timeoutMs = 180_000;
  const pollInterval = 5000; // 1 second
  const startTime = Date.now();

  DokoJSLogger.info(`Validating transaction: ${pollUrl}`);
  let retryCount = 0;

  while (Date.now() - startTime < timeoutMs) {
    try {
      const response = await get(pollUrl);
      const data = (await response.json()) as TransactionModel & {
        deployment: any;
      };
      if (!data.execution && !data.deployment) {
        console.error('Transaction error');
      }
      return data;
    } catch (e: any) {
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
      retryCount++;
      DokoJSLogger.log(`Retrying, count: ${retryCount}: `, e.message);
    }
  }

  DokoJSLogger.info('Broadcast validation timeout');
  return null;
};
