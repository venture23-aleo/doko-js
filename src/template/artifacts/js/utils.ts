import { exec } from 'child_process';
//import { readFile } from 'fs/promises';
//import { join } from 'path';
import { promisify } from 'util';
//import { LeoTx, LeoRecord, LeoViewKey } from './types/leo-types';
//import { ViewKey } from '@aleohq/sdk';

export interface ContractConfig {
  privateKey?: string;
  viewKey?: string;
  appName?: string;
  contractPath?: string;
  fee?: string;
}

export const execute = promisify(exec);

export const parseRecordString = (
  recordString: string
): Record<string, unknown> => {
  const json = recordString.replace(/(['"])?([a-z0-9A-Z_.]+)(['"])?/g, '"$2" ');
  let correctJson = json;
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
}

export const leoRun = async ({
  config,
  params = [],
  transition = 'main'
}: LeoRunParams): Promise<Record<string, unknown>> => {
  let stringedParams = params.join(' ');
  stringedParams = stringedParams.replace(/"|"/g, '');
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
  return leoRun(params);
};
