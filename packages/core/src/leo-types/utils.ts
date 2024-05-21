import { get, post } from '@/utils/httpRequests';
import { TransactionModel } from '@aleohq/sdk';
import { exec } from 'child_process';
import { promisify } from 'util';
import { ContractConfig, SnarkDeployResponse, SnarkExecuteResponse, TransactionResponse } from './transaction';

export const execute = promisify(exec);
interface LeoRunParams {
  config: ContractConfig;
  params?: string[];
  transition?: string;
  mode?: string;
}

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

const parseTransactionFromStdout = (stdout: string) => {
  return JSON.parse(stdout.match(/\{([^)]+)\}/)![0]);
};

const checkDeployment = async (endpoint: string): Promise<boolean> => {
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

export const snarkDeploy = async ({
  config
}: LeoRunParams): Promise<TransactionResponse> => {
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
  const transaction = parseTransactionFromStdout(stdout);
  await broadcastTransaction(transaction, nodeEndPoint);
  return new SnarkDeployResponse(transaction, config);
};

type ExecuteZkLogicParams = LeoRunParams;
export const zkGetMapping = async (
  params: ExecuteZkLogicParams
): Promise<any> => {
  if (!params) return null;
  if (!params.config.network) {
    throw new Error('Network is not defined');
  }
  if (!params.params) return null;
  const url = `${params.config.network.endpoint}/${params.config.networkName}/program/${params.config.appName}.aleo/mapping/${params.transition}/${params.params[0]}`;
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

export const leoGetContractAddress = async (contractName: string) => {
  const cmd = `leo account program ${contractName}`;
  const { stdout } = await execute(cmd);
  console.log(stdout);
  return stdout;
};
