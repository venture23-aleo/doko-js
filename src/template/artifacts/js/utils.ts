import axios from 'axios';
import { exec } from 'child_process';
//import { readFile } from 'fs/promises';
//import { join } from 'path';
import { promisify } from 'util';
//import { LeoTx, LeoRecord, LeoViewKey } from './types/leo-types';
//import { ViewKey } from '@aleohq/sdk';

interface ServerConfig {
  host: string;
  port: number;
}

interface NetworkConfig {
  node: string;
  server: ServerConfig;
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

export const snarkExecute = async ({
  config,
  params = [],
  transition = 'main'
}: LeoRunParams): Promise<Record<string, unknown>> => {
  let stringedParams = params.join(' ');
  stringedParams = stringedParams.replace(/{/g, '"{').replace(/}/, '}"');
  // snarkos developer execute sample_program.aleo main  "1u32" "2u32" --private-key APrivateKey1zkp8CZNn3yeCseEtxuVPbDCwSyhGW6yZKUYKfgXmcpoGPWH --query "http://localhost:3030" --broadcast "http://localhost:3030/testnet3/transaction/broadcast"
  // const cmd = `cd ${config.contractPath} && snarkos developer execute  ${config.appName}.aleo ${transition} ${stringedParams} --private-key ${config.privateKey} --query ${nodeEndPoint} --broadcast "${nodeEndPoint}/testnet3/transaction/broadcast"`;
  const cmd = `cd ${config.contractPath} && leo execute ${transition} ${stringedParams}`; /* --private-key ${config.privateKey} --query ${nodeEndPoint} --broadcast "${nodeEndPoint}/testnet3/transaction/broadcast"`;*/
  console.log(cmd);
  const { stdout } = await execute(cmd);
  console.log(stdout);
  const output = stdout.match(/\{([^)]+)\}/);
  const outArr = output[0].split('{');
  const data = [
    '',
    ...outArr.slice(outArr.findIndex((v) => v.includes('"type":"execute"')))
  ].join('{');
  const parsedOutput = JSON.parse(data);
  const outPuts = parsedOutput?.execution?.transitions?.map(
    (transition) => transition.outputs
  );

  return { data: outPuts };
};

const checkDeployment = async (endpoint: string): Promise<boolean> => {
  try {
    console.log(`Checking deployment: ${endpoint}`);
    await axios.get(endpoint);

    return true;
  } catch (e: any) {
    if (e?.response?.data?.includes('Missing program for ID')) {
      return false;
    }

    throw new Error(
      `Failed to deploy program: ${
        e?.response?.data ?? 'Error occured while deploying program'
      }`
    );
  }
};

export const snarkDeploy = async ({
  config
}: LeoRunParams): Promise<Record<string, unknown>> => {
  const nodeEndPoint = config['network']?.node;
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
  return { data: stdout };
};

export const leoRun = async ({
  config,
  params = [],
  transition = 'main'
}: LeoRunParams): Promise<Record<string, unknown>> => {
  let stringedParams = params.join(' ');
  stringedParams = stringedParams.replace(/{/g, '"{').replace(/}/, '}"');

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
  return leoRun(params);
};
