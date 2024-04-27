import { get, post } from "@/utils/httpRequests";
import { ContractConfig } from "./types";
import { TransactionModel } from "@aleohq/sdk";
import { execute } from "./execution-helper";
import { StdoutResponseParser } from "./output-parser";
import { tx } from "../outputs";

// Convert json like string to json
export function parseJSONLikeString(
  recordString: string
): Record<string, unknown> {
  const json = recordString.replace(/(['"])?([a-z0-9A-Z_.]+)(['"])?/g, '"$2" ');
  const correctJson = json;
  return JSON.parse(correctJson);
};

export const zkGetMapping = async (
  config: ContractConfig,
  mappingName: string,
  key: string
): Promise<any> => {
  if (!config) return null;
  if (!config.network) {
    throw new Error('Network is not defined');
  }
  const url = `${config.network.endpoint}/${config.networkName}/program/${config.appName}.aleo/mapping/${mappingName}/${key}`;
  console.log(url);
  try {
    const response = await fetch(url);
    let data = await response.json();
    if (data == null) {
      return null;
    }
    data = (data as string).replace(/(['"])?([a-z0-9A-Z_.]+)(['"])?/g, '"$2" ');
    return JSON.parse(data as string);
  } catch (err) {
    console.log(err);
  }
};

export const checkDeployment = async (endpoint: string): Promise<boolean> => {
  try {
    console.log(`Checking deployment: ${endpoint}`);
    const response = await get(endpoint);
    await response.json();

    return true;
  } catch (e: any) {
    if (e?.message?.includes('Missing program for ID')) {
      console.log('Deployment not found');
      return false;
    }
    console.log(e);

    throw new Error(
      `Failed to deploy program: ${e?.message ?? 'Error occured while deploying program'
      }`
    );
  }
};

const broadcastTransaction = async (
  transaction: TransactionModel,
  endpoint: string
) => {
  try {
    return await post(`${endpoint}/testnet3/transaction/broadcast`, {
      body: JSON.stringify(transaction),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (err) {
    console.error(err);
  }
};

export const snarkDeploy = async (config : ContractConfig): Promise<TransactionModel> => {
  const nodeEndPoint = config['network']?.endpoint;

  if (!nodeEndPoint) {
    throw new Error('networkName missing in contract config for deployment');
  }

  const priorityFee = config.priorityFee || 0;

  const isProgramDeployed = await checkDeployment(
    `${nodeEndPoint}/testnet3/program/${config.appName}.aleo`
  );

  if (isProgramDeployed) {
    throw new Error(`Program ${config.appName} is already deployed`);
  }

  console.log(`Deploying program ${config.appName}`);

  const cmd = `cd ${config.contractPath}/build && snarkos developer deploy "${config.appName}.aleo" --path . --priority-fee ${priorityFee}  --private-key ${config.privateKey} --query ${nodeEndPoint} --dry-run`;
  const { stdout } = await execute(cmd);
  const result = new StdoutResponseParser().parse(stdout);
  // @TODO check it later
  await broadcastTransaction(result.transaction as TransactionModel, nodeEndPoint);
  return result.transaction as TransactionModel;
};

const validateBroadcast = async (
  transactionId: string,
  nodeEndpoint: string
) => {
  const pollUrl = `${nodeEndpoint}/testnet3/transaction/${transactionId}`;
  const timeoutMs = 60_000;
  const pollInterval = 1000; // 1 second
  const startTime = Date.now();

  console.log(`Validating transaction: ${pollUrl}`);
  while (Date.now() - startTime < timeoutMs) {
    try {
      const response = await get(pollUrl);
      const data = await response.json();

      if (!(data.execution || data.deployment)) {
        console.error('Transaction error');
        data.error = true;
      }
      return data as tx.Receipt & { error: true | undefined };
    } catch (e: any) {
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
      console.log('Retrying: ', e.message);
    }
  }

  console.log('Timeout');
};

export const waitTransaction = async (
  transaction: TransactionModel,
  endpoint: string
) => {
  const transactionId = transaction.id;
  if (transactionId) return await validateBroadcast(transactionId, endpoint);
  return null;
};

