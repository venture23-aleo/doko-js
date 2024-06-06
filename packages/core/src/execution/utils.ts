import { get, post } from '@/utils/httpRequests';
import { ContractConfig } from './types';
import { TransactionModel } from '@aleohq/sdk';
import { execute } from './execution-helper';
import {
  SnarkStdoutResponseParser,
  StdoutResponseParser
} from './output-parser';
import { tx } from '../outputs';
import {
  SnarkDeployResponse,
  TransactionResponse
} from '@/leo-types/transaction';
import { DokoJSError, DokoJSLogger, ERRORS } from '@doko-js/utils';

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

export const snarkDeploy = async ({
  config
}: {
  config: ContractConfig;
}): Promise<TransactionResponse> => {
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

  const cmd = `cd ${config.contractPath}/build && snarkos developer deploy "${config.appName}.aleo" --path . --priority-fee ${priorityFee}  --private-key ${config.privateKey} --query ${nodeEndPoint} --dry-run`;
  DokoJSLogger.debug(cmd);

  const { stdout } = await execute(cmd);
  const result = new SnarkStdoutResponseParser().parse(stdout);
  // @TODO check it later
  await broadcastTransaction(
    result.transaction as TransactionModel,
    nodeEndPoint,
    config.networkName!
  );
  return new SnarkDeployResponse(
    result.transaction as TransactionModel,
    config
  );
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
      const data = (await response.json()) as TransactionModel & {
        deployment: any;
      };
      if (!data.execution && !data.deployment) {
        DokoJSLogger.warn('Transaction error');
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
