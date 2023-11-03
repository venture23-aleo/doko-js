import { exec } from 'child_process';
//import { readFile } from 'fs/promises';
//import { join } from 'path';
import { promisify } from 'util';
//import { LeoTx, LeoRecord, LeoViewKey } from './types/leo-types';
//import { ViewKey } from '@aleohq/sdk';

export const execute = promisify(exec);

export const parseRecordString = (
  recordString: string
): Record<string, unknown> => {
  const json = recordString.replace(/(['"])?([a-z0-9A-Z_.]+)(['"])?/g, '"$2" ');
  let correctJson = json;
  return JSON.parse(correctJson);
};

const parseCmdOutput = (cmdOutput: string): Record<string, unknown> => {
  const lines = cmdOutput.split('\n');

  let res: Record<string, unknown> = {};

  let objectStarted = false;
  let objectFinished = false;
  let done = false;
  let toParse = '';

  lines.forEach((line) => {
    if (done) return;

    if (objectStarted && objectFinished) {
      res = parseRecordString(toParse);
      done = true;
    } else if (objectStarted) {
      if (line.startsWith('}')) {
        objectFinished = true;
      }
      const trimmedLine = line.trim();
      toParse = toParse + trimmedLine;
    } else if (line.includes('• {') || line.startsWith('{')) {
      toParse = toParse + '{';
      objectStarted = true;
    }
  });

  return res;
};

interface LeoRunParams {
  contractPath: string;
  params?: string[];
  transition?: string;
}

export const leoRun = async ({
  contractPath,
  params = [],
  transition = 'main'
}: LeoRunParams): Promise<Record<string, unknown>> => {
  const stringedParams = params.join(' ');
  const cmd = `cd ${contractPath} && leo run ${transition} ${stringedParams}`;
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
