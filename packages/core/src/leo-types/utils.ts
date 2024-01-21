import axios from 'axios';
import { exec } from 'child_process';
//import { readFile } from 'fs/promises';
//import { join } from 'path';
import { promisify } from 'util';
//import { LeoTx, LeoRecord, LeoViewKey } from './types/leo-types';
//import { ViewKey } from '@aleohq/sdk';

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

export const execute = promisify(exec);

export const parseRecordString = (
  recordString: string
): Record<string, unknown> => {
  const json = recordString.replace(/(['"])?([a-z0-9A-Z_.]+)(['"])?/g, '"$2" ');
  const correctJson = json;
  return JSON.parse(correctJson);
};

const parseCmdOutput = (cmdOutput: string): Record<string, unknown> => {
  // Try splitting as if it is multiple output
  let strAfterOutput = cmdOutput.split('Outputs')[1];

  // if it has multiple outputs
  let res: Record<string, unknown> = {};

  if (strAfterOutput) {
    const outputLines = strAfterOutput
      .split('\n')
      .filter((str) => str.trim().length > 0);
    outputLines.pop();

    strAfterOutput = outputLines.join('\n');
    const outputs = strAfterOutput
      .split('•')
      .filter((str) => str.trim()?.length > 0);
    res = { data: outputs.map((output) => parseRecordString(output)) };
  } else {
    strAfterOutput = cmdOutput.split('Output')[1];
    let lines = strAfterOutput.split('\n').filter((str) => str != '');
    // Remove last line which include the location details
    lines.pop();

    // Remove the '• ' first two character
    lines[0] = lines[0].replace(/^.{2}/g, '');
    lines = lines.map((str) => str.trim());

    // Return type is primitive type
    if (lines.length === 1) res = { data: [lines[0]] };
    else res = { data: [parseRecordString(lines.join('\n'))] };
  }
  return res;
};

interface LeoRunParams {
  config: ContractConfig;
  params?: string[];
  transition?: string;
  mode?: string;
}

const withReceipt = (stdout: string, nodeEndPoint: string) => {
  return { wait: () => waitTransaction(stdout, nodeEndPoint), result: stdout };
};

export const snarkExecute = async ({
  config,
  params = [],
  transition = 'main'
}: LeoRunParams): Promise<Record<string, unknown>> => {
  const nodeEndPoint = config['network']?.endpoint;
  if (!nodeEndPoint) {
    throw new Error('networkName missing in contract config for deployment');
  }
  const stringedParams = params.map((s) => `"${s}"`).join(' ');
  // snarkos developer execute sample_program.aleo main  "1u32" "2u32" --private-key APrivateKey1zkp8CZNn3yeCseEtxuVPbDCwSyhGW6yZKUYKfgXmcpoGPWH --query "http://localhost:3030" --broadcast "http://localhost:3030/testnet3/transaction/broadcast"
  // const cmd = `cd ${config.contractPath} && snarkos developer execute  ${config.appName}.aleo ${transition} ${stringedParams} --private-key ${config.privateKey} --query ${nodeEndPoint} --broadcast "${nodeEndPoint}/testnet3/transaction/broadcast"`;
  const cmd = `cd ${config.contractPath} && snarkos developer execute ${config.appName}.aleo ${transition} ${stringedParams} --private-key ${config.privateKey} --query ${nodeEndPoint} --broadcast "${nodeEndPoint}/testnet3/transaction/broadcast"`;
  console.log(cmd);
  const { stdout } = await execute(cmd);
  console.log(stdout);
  return withReceipt(stdout, nodeEndPoint);
};

export const leoExecute = async ({
  config,
  params = [],
  transition = 'main'
}: LeoRunParams): Promise<Record<string, unknown>> => {
  const stringedParams = params.map((s) => `"${s}"`).join(' ');
  // snarkos developer execute sample_program.aleo main  "1u32" "2u32" --private-key APrivateKey1zkp8CZNn3yeCseEtxuVPbDCwSyhGW6yZKUYKfgXmcpoGPWH --query "http://localhost:3030" --broadcast "http://localhost:3030/testnet3/transaction/broadcast"
  // const cmd = `cd ${config.contractPath} && snarkos developer execute  ${config.appName}.aleo ${transition} ${stringedParams} --private-key ${config.privateKey} --query ${nodeEndPoint} --broadcast "${nodeEndPoint}/testnet3/transaction/broadcast"`;
  const cmd = `cd ${config.contractPath} && leo execute ${transition} ${stringedParams}`; /* --private-key ${config.privateKey} --query ${nodeEndPoint} --broadcast "${nodeEndPoint}/testnet3/transaction/broadcast"`;*/
  console.log(cmd);
  const { stdout } = await execute(cmd);
  console.log(stdout);
  const output = stdout.match(/\{([^)]+)\}/);
  //@ts-expect-error Output maybe null
  const outArr = output[0].split('{');
  const data = [
    '',
    ...outArr.slice(outArr.findIndex((v) => v.includes('"type":"execute"')))
  ].join('{');
  const parsedOutput = JSON.parse(data);
  const outPuts = parsedOutput?.execution?.transitions?.map(
    (transition: { outputs: any; }) => transition.outputs
  );

  return { data: outPuts };
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

  console.log(`Validating deployment: ${pollUrl}`);
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

const getTransactionId = (stdOut: string) => {
  const regex = /\b([a-z0-9]{61})\b/;
  const match = stdOut.match(regex);
  let transactionId = null;

  if (match) {
    transactionId = match[1];
    console.log('Transaction ID:', transactionId);
  } else {
    console.log('Transaction ID not found in the input.');
  }

  return transactionId;
};

const waitTransaction = async (stdOut: string, endpoint: string) => {
  const output = typeof stdOut === 'string' ? stdOut : JSON.stringify(stdOut);
  const transactionId = getTransactionId(output);

  if (transactionId) return await validateBroadcast(transactionId, endpoint);
  return null;
};

export const snarkDeploy = async ({
  config
}: LeoRunParams): Promise<Record<string, unknown>> => {
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

  const cmd = `cd ${config.contractPath}/build && snarkos developer deploy "${config.appName}.aleo" --path . --priority-fee ${priorityFee}  --private-key ${config.privateKey} --query ${nodeEndPoint} --broadcast "${nodeEndPoint}/testnet3/transaction/broadcast"`;
  const { stdout } = await execute(cmd);
  console.log(stdout);

  return withReceipt(stdout, nodeEndPoint);
};

export const leoRun = async ({
  config,
  params = [],
  transition = 'main'
}: LeoRunParams): Promise<Record<string, unknown>> => {
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
): Promise<Record<string, unknown>> => {
  if (params.config.mode === 'execute') return snarkExecute(params);
  if (params.config.mode === 'leo_execute') return leoExecute(params);
  return leoRun(params);
};

export const zkGetMapping = async (
  params: ExecuteZkLogicParams
): Promise<any> => {
  //@ts-expect-error Output maybe null
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