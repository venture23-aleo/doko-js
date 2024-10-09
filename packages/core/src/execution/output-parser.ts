import { DokoJSError, ERRORS } from '@doko-js/utils';
import { ExecutionOutput } from './types';
import { parseJSONLikeString } from './utils';

export interface ExecutionOutputParser {
  parse(data: string): ExecutionOutput;
}

export class StdoutResponseParser implements ExecutionOutputParser {
  parse(cmdOutput: string): ExecutionOutput {
    // Try splitting as if it is multiple output
    const result: ExecutionOutput = {
      data: [],
      transaction: undefined
    };

    let strAfterOutput = cmdOutput.split('Outputs')[1];
    // if it has multiple outputs
    if (!strAfterOutput) {
      strAfterOutput = cmdOutput.split('Output')[1];
      // No output at all
      if (!strAfterOutput) {
        const stringBlock = cmdOutput.split('\n\n').slice(3);
        stringBlock.pop();
        if (stringBlock.length > 0)
          result.transaction = JSON.parse(stringBlock[0]);
        return { data: result };
      }
    }

    // this separates the string after the output into three logical blocks
    // 1. Outputs, 2. Transactions(if present), 3. Leo execute/run block
    const stringBlock = strAfterOutput
      .split('\n\n')
      .filter((str) => str.trim().length > 0);
    // Remove the last line as this is just the status result of execution command
    stringBlock.pop();

    // Remove unnecessary character
    const outputs = stringBlock
      .shift()
      ?.split('•')
      .filter((line) => line.trim().length > 0);

    if (outputs && outputs.length > 0)
      result.data = outputs.map((output) => parseJSONLikeString(output));

    // Parse transaction block if it is present
    if (stringBlock.length > 0)
      result.transaction = JSON.parse(stringBlock.shift() || '');

    // Process transaction block if present
    return result;
  }
}

export class SnarkStdoutResponseParser implements ExecutionOutputParser {
  parse(output: string): ExecutionOutput {
    const tx_id = output.match(/at\S{59}/);
    if (tx_id == null || tx_id.length == 0)
      throw new DokoJSError(ERRORS.GENERAL.UNSUPPORTED_OPERATION, {
        operation: 'Transaction error'
      });
    return {
      data: [],
      transaction: tx_id[0]
    };
  }
}
