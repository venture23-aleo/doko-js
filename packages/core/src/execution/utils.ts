import { get, post } from '@/utils/httpRequests';
import { ContractConfig } from './types';
import { TransactionModel } from '@aleohq/sdk';
import { execute } from './execution-helper';
import { SnarkStdoutResponseParser } from './output-parser';
import {
  SnarkDeployResponse,
  TransactionResponse
} from '@/leo-types/transaction';
import { DokoJSError, DokoJSLogger, ERRORS } from '@doko-js/utils';
import fs from 'fs-extra';
import path, { join } from 'path';
import { tmpdir } from 'os';

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

export const checkDeployment = async (endpoint: string): Promise<boolean> => {
  try {
    DokoJSLogger.info(`Checking deployment: ${endpoint}`);
    const response = await get(endpoint);
    await response.json();

    return true;
  } catch (e: any) {
    if (e?.message?.includes('Missing program for ID')) {
      DokoJSLogger.info('Deployment not found');

      return false;
    }

    throw new DokoJSError(ERRORS.NETWORK.DEPLOYMENT_CHECK_FAIL, {}, e);
  }
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
  const cmd = `cd ${projectDir} && leo deploy --priority-fee ${priorityFee} --private-key ${config.privateKey} --no-build --endpoint ${nodeEndPoint} --network ${config.networkName} --yes`;
  DokoJSLogger.debug(cmd);
  const { stdout } = await execute(cmd);
  const result = transactionHashToTransactionResponseObject(
    stdout.split('Deployment')[2].split(' ')[1],
    'deploy'
  );
  return new SnarkDeployResponse(result as TransactionModel, config);
}

const snarkDeployAleo = async ({
  config
}: {
  config: ContractConfig;
}): Promise<TransactionResponse> => {
  const aleoCode = await fs.readFile(`${config.contractPath}.aleo`);
  const importsDir = path.normalize(path.join(config.contractPath, '..'));

  return deployAleo(aleoCode.toString('utf-8'), config, importsDir);
};

export const snarkDeploy = async ({
  config
}: {
  config: ContractConfig;
}): Promise<TransactionResponse> => {
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


  // const cmd = `cd ${config.contractPath}/build && leo deploy --priority-fee ${priorityFee}  --private-key ${config.privateKey} --endpoint ${nodeEndPoint} --network ${config.networkName}`;
  const cmd = `cd ${config.contractPath} && leo deploy --priority-fee ${priorityFee}  --private-key ${config.privateKey} --endpoint ${nodeEndPoint} --network ${config.networkName} --yes`;


  DokoJSLogger.debug(cmd);


  const { stdout } = await execute(cmd);
  const result = transactionHashToTransactionResponseObject(
    stdout.split('Deployment')[2].split(' ')[1],
    'deploy'
  );
  // // @TODO check it later
  // await broadcastTransaction(
  //   result as TransactionModel,
  //   nodeEndPoint,
  //   config.networkName!
  // );
  return new SnarkDeployResponse(result as TransactionModel, config);
};

export const transactionHashToTransactionResponseObject = (
  transactionHash: string,
  type: 'deploy' | 'execute'
): TransactionModel | null => {
  const transaction = { id: transactionHash, type, execution: { edition: 1 } };
  return transaction;
};

export const validateBroadcast = async (
  transactionId: string,
  nodeEndpoint: string,
  networkName: string
): Promise<TransactionModel | null> => {
  const pollUrl = `${nodeEndpoint}/${networkName}/transaction/${transactionId}`;
  const timeoutMs = 60_000;
  const pollInterval = 1000; // 1 second
  const startTime = Date.now();

  DokoJSLogger.info(`Validating transaction: ${pollUrl}`);
  const retryCount = 0;

  while (Date.now() - startTime < timeoutMs) {
    try {
      const response = await get(pollUrl);
      const data = await response.json() as TransactionModel & { deployment: any };
      if (!data.execution && !data.deployment) {
        console.error('Transaction error');
      }
      return data;
    } catch (e: any) {
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
      DokoJSLogger.log(`Retrying, count: ${retryCount}: `, e.message);
    }
  }

  DokoJSLogger.info('Broadcast validation timeout');

  return null;
};

export const waitTransaction = async (
  transaction: TransactionModel,
  endpoint: string,
  networkName: string
) => {
  const transactionId = transaction.id;
  if (transactionId)
    return await validateBroadcast(transactionId, endpoint, networkName);
  return null;
};
