import { Output, TransactionModel } from '@aleohq/sdk';
import { get_decrypted_value } from 'aleo-ciphertext-decryptor';
import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';

interface NetworkConfig {
  endpoint: string;
}

export interface ContractConfig {
  privateKey?: string;
  viewKey?: string;
  appName?: string;
  contractPath?: string;
  fee?: string;
  network?: NetworkConfig;
  networkName?: string;
  mode?: string;
  priorityFee?: number;
}

export interface ZkExecutionOutput {
  data: any,
  transaction?: TransactionModel
};

export const execute = promisify(exec);

export const parseRecordString = (
  recordString: string
): Record<string, unknown> => {
  const json = recordString.replace(/(['"])?([a-z0-9A-Z_.]+)(['"])?/g, '"$2" ');
  const correctJson = json;
  return JSON.parse(correctJson);
};

const parseCmdOutput = (cmdOutput: string): ZkExecutionOutput => {
  let res: ZkExecutionOutput = {
    data: null
  };

  // Try splitting as if it is multiple output
  let strAfterOutput = cmdOutput.split('Outputs')[1];
  // if it has multiple outputs
  if (!strAfterOutput) {
    strAfterOutput = cmdOutput.split('Output')[1];
    // No output at all
    if (!strAfterOutput) {
      const stringBlock = cmdOutput.split('\n\n').slice(3);
      stringBlock.pop();
      if (stringBlock.length > 0)
        res.transaction = JSON.parse(stringBlock[0]);
      return res;
    };
  }

  // this separates the string after the output into three logical blocks
  // 1. Outputs, 2. Transactions(if present), 3. Leo execute/run block
  let stringBlock = strAfterOutput.split('\n\n').filter((str) => str.trim().length > 0);
  // Remove the last line as this is just the status result of execution command
  stringBlock.pop();

  // Remove unnecessary character
  const outputs = stringBlock.shift()?.split('•').filter(line => line.trim().length > 0);
  res.data = outputs?.map((output) => parseRecordString(output));

  // Parse transaction block if it is present
  if (stringBlock.length > 0)
    res.transaction = JSON.parse(stringBlock.shift() || '');

  // Process transaction block if present
  return res;
};

interface LeoRunParams {
  config: ContractConfig;
  params?: string[];
  transition?: string;
  mode?: string;
}
/*
const withReceipt = (stdout: string, nodeEndPoint: string) => {
    return { wait: () => waitTransaction(stdout, nodeEndPoint), result: stdout };
};
*/

const broadcastTransaction = async (transaction: TransactionModel, endpoint: string) => {
  try {
    return axios.post(`${endpoint}/testnet3/transaction/broadcast`, transaction);
  } catch (err) {
    console.error(err);
  }
}

const parseTransactionFromStdout = (stdout: string) => {
  return JSON.parse(stdout.match(/\{([^)]+)\}/)![0]);
}

export const snarkExecute = async ({
  config,
  params = [],
  transition = 'main'
}: LeoRunParams): Promise<ZkExecutionOutput> => {
  const nodeEndPoint = config['network']?.endpoint;
  if (!nodeEndPoint) {
    throw new Error('networkName missing in contract config for deployment');
  }
  const stringedParams = params.map((s) => `"${s}"`).join(' ');
  // snarkos developer execute sample_program.aleo main  "1u32" "2u32" --private-key APrivateKey1zkp8CZNn3yeCseEtxuVPbDCwSyhGW6yZKUYKfgXmcpoGPWH --query "http://localhost:3030" --broadcast "http://localhost:3030/testnet3/transaction/broadcast"
  // const cmd = `cd ${config.contractPath} && snarkos developer execute  ${config.appName}.aleo ${transition} ${stringedParams} --private-key ${config.privateKey} --query ${nodeEndPoint} --broadcast "${nodeEndPoint}/testnet3/transaction/broadcast"`;
  const cmd = `cd ${config.contractPath} && snarkos developer execute ${config.appName}.aleo ${transition} ${stringedParams} --private-key ${config.privateKey} --query ${nodeEndPoint} --dry-run`;
  console.log(cmd);
  //const cmd = `cd ${config.contractPath} && snarkos developer execute ${config.appName}.aleo ${transition} ${stringedParams} --private-key ${config.privateKey} --query ${nodeEndPoint} --broadcast "${nodeEndPoint}/testnet3/transaction/broadcast"`;
  const { stdout } = await execute(cmd);
  const transaction = parseTransactionFromStdout(stdout);
  const res = await broadcastTransaction(transaction, nodeEndPoint);
  return { data: decryptOutput(transaction, transition, config.appName!, config.privateKey || ''), transaction };
};

const decryptOutput = (transaction: TransactionModel, transitionName: string, programName: string, privateKey: string) => {
  if (!transaction.execution.transitions) return;
  const transitions = transaction.execution.transitions.filter(transition => transition.function == transitionName);
  if (transitions.length === 0) return;

  const transition = transitions.filter(transition => transition.program == programName);
  if (transition.length == 0) return;

  const offset = transition[0].inputs ? transition[0].inputs.length : 0;
  if (transition[0].outputs) {
    const outputs = transition[0].outputs.map((output: Output, index: number) => {
      let val = output.value;
      if (output.type == 'private') {
        val = get_decrypted_value(output.value,
          programName,
          transitionName,
          offset + index,
          privateKey,
          transition[0].tpk);
      }
      else if (output.type == 'record') {
        val = output.value;
      }
      return parseRecordString(val);
    });
    return outputs;
  }
  return null;
}

export const leoExecute = async ({
  config,
  params = [],
  transition = 'main'
}: LeoRunParams): Promise<ZkExecutionOutput> => {
  const stringedParams = params.map((s) => `"${s}"`).join(' ');
  // snarkos developer execute sample_program.aleo main  "1u32" "2u32" --private-key APrivateKey1zkp8CZNn3yeCseEtxuVPbDCwSyhGW6yZKUYKfgXmcpoGPWH --query "http://localhost:3030" --broadcast "http://localhost:3030/testnet3/transaction/broadcast"
  // const cmd = `cd ${config.contractPath} && snarkos developer execute  ${config.appName}.aleo ${transition} ${stringedParams} --private-key ${config.privateKey} --query ${nodeEndPoint} --broadcast "${nodeEndPoint}/testnet3/transaction/broadcast"`;
  const cmd = `cd ${config.contractPath} && leo execute ${transition} ${stringedParams}`; /* --private-key ${config.privateKey} --query ${nodeEndPoint} --broadcast "${nodeEndPoint}/testnet3/transaction/broadcast"`;*/
  console.log(cmd);

  const { stdout } = await execute(cmd);
  const { transaction } = parseCmdOutput(stdout);
  const decrypedData = decryptOutput(transaction!, transition, config.appName!, config.privateKey || '');
  return {
    data: decrypedData,
    transaction
  };
};

const checkDeployment = async (endpoint: string): Promise<boolean> => {
  try {
    console.log(`Checking deployment: ${endpoint}`);
    await axios.get(endpoint);
    return true;
  } catch (e: any) {
    console.log(e);
    if (e?.response?.data?.includes('Missing program for ID')) {
      return false;
    }

    throw new Error(
      `Failed to deploy program: ${e?.response?.data ?? 'Error occured while deploying program'
      }`
    );
  }
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
      const { data } = await axios.get(pollUrl);

      if (!(data.execution || data.deployment)) {
        console.error('Transaction error');
        data.error = true;
      }
      return data;
    } catch (e: any) {
      console.log(e.response.data);
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
      console.log('Retrying');
    }
  }

  console.log('Timeout');
};

export const waitTransaction = async (transaction: TransactionModel, endpoint: string) => {
  const transactionId = transaction.id;
  if (transactionId) return await validateBroadcast(transactionId, endpoint);
  return null;
};

export const snarkDeploy = async ({
  config
}: LeoRunParams): Promise<TransactionModel> => {
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

  const cmd = `cd ${config.contractPath}/build && snarkos developer deploy "${config.appName}.aleo" --path . --priority-fee ${priorityFee}  --private-key ${config.privateKey} --query ${nodeEndPoint} --dry-run`;
  const { stdout } = await execute(cmd);
  const transaction = parseTransactionFromStdout(stdout);
  await broadcastTransaction(transaction, nodeEndPoint);
  return transaction;
};

export const leoRun = async ({
  config,
  params = [],
  transition = 'main'
}: LeoRunParams): Promise<ZkExecutionOutput> => {
  const stringedParams = params.map((s) => `"${s}"`).join(' ');
  const cmd = `cd ${config.contractPath} && leo run ${transition} ${stringedParams}`;
  console.log(cmd);
  const { stdout } = await execute(cmd);
  console.log(stdout);
  const parsed = parseCmdOutput(stdout);
  return parsed;
};

type ExecuteZkLogicParams = LeoRunParams;

export const zkRun = (
  params: ExecuteZkLogicParams
): Promise<ZkExecutionOutput> => {
  if (params.config.mode === 'execute') return snarkExecute(params);
  if (params.config.mode === 'leo_execute') return leoExecute(params);
  return leoRun(params);
};

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
}
