import { get, post } from '@/utils/httpRequests';
import { ContractConfig } from './types';
import { Transaction } from '@provablehq/sdk';
import { execute } from './execution-helper';
import {
  SnarkDeployResponse,
  TransactionResponse
} from '@/leo-types/transaction';
import {
  DokoJSError,
  DokoJSLogger,
  ERRORS,
  getProjectRoot
} from '@doko-js/utils';
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

export const sleep = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

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
  await sleep(2000);
  const url = `${config.network.endpoint}/${config.network.network}/program/${config.appName}.aleo/mapping/${mappingName}/${key}`;
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
  transaction: Transaction,
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

export const snarkDeploy = async ({
  config
}: {
  config: ContractConfig;
}): Promise<TransactionResponse<any>> => {
  if (config.isImportedAleo) {
    throw new DokoJSError(
      ERRORS.INTERNAL.INVALID_IMPORTS_ALEO_PROGRAM_DEPLOYMENT,
      {
        programName: `${config.appName}.aleo`
      }
    );
  }

  const nodeEndPoint = config['network']?.endpoint;

  if (!nodeEndPoint) {
    throw new DokoJSError(ERRORS.VARS.VALUE_NOT_FOUND_FOR_VAR, {
      value: 'networkName'
    });
  }

  const priorityFee = config.priorityFee || 0;

  const isProgramDeployed = await checkDeployment(
    `${nodeEndPoint}/${config.network.network}/program/${config.appName}.aleo`
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
    const projectRoot = getProjectRoot();
    for (const dependency of programJson.dependencies) {
      const isDeployed = await checkDeployment(
        `${nodeEndPoint}/${config.network.network}/program/${dependency.name}`
      );
      if (isDeployed) {
        dependency.location = 'network';
        dependency.endpoint = nodeEndPoint;
        dependency.network = config.network.network;
        dependency.path = undefined;
      } else {
        dependency.location = 'local';
        dependency.endpoint = undefined;
        dependency.network = undefined;
        dependency.path = `${projectRoot}/imports/${dependency.name}`;
      }
      dependencies.push(dependency);
    }
    programJson.dependencies = dependencies;
    await fs.writeJSON(`${config.contractPath}/program.json`, programJson);
  }

  const cmd = leoDeployCommand(
    config.contractPath,
    config.privateKey,
    nodeEndPoint,
    config.network.network,
    config.isDevnet
  );
  DokoJSLogger.debug(cmd);

  const { stdout } = await execute(cmd);
  const result = transactionHashToTransactionResponseObject(
    extractTransactionId(stdout)!,
    'deploy'
  );
  return new SnarkDeployResponse(result?.id || '', config);
};

export const leoDeployCommand = (
  path: string,
  privateKey: string,
  endpoint: string,
  network: string = 'testnet',
  isDevnet: boolean = false
) => {
  return `cd ${path} && leo deploy --broadcast --private-key ${privateKey} --endpoint ${endpoint} --network ${network} --yes --print ${isDevnet ? '--devnet' : ''}`;
};

export const transactionHashToTransactionResponseObject = (
  transactionHash: string,
  type: 'deploy' | 'execute'
): Transaction | null => {
  const transaction = { id: transactionHash, type, execution: { edition: 1 } };
  return transaction;
};

export const validateBroadcast = async (
  transactionId: string,
  nodeEndpoint: string,
  networkName: string
): Promise<Transaction | null> => {
  const pollUrl = `${nodeEndpoint}/${networkName}/transaction/${transactionId}`;
  const timeoutMs = 180_000;
  const pollInterval = 5000; // 1 second
  const startTime = Date.now();

  DokoJSLogger.info(`Validating transaction: ${pollUrl}`);
  let retryCount = 0;

  while (Date.now() - startTime < timeoutMs) {
    try {
      const response = await get(pollUrl);
      const data = (await response.json()) as Transaction & {
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

export function extractTransactionId(output: string): string | null {
  const regex = /transaction ID:\s*['"]([^'"]+)['"]/i; // Regex detects transaction id like this: transaction ID: "0xdeadbeef"
  const match = output.match(regex);
  return match ? match[1] : null;
}
