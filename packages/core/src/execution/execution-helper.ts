// @TODO replace this with shell
import { Output, TransactionModel } from '@provablehq/sdk';
import { Decrypter } from '@doko-js/wasm';
import { exec } from 'child_process';
import { promisify } from 'util';
import { parseJSONLikeString } from './utils';
import { Optional } from './types';

const _execute = promisify(exec);
export const execute = (cmd: string) => {
  return _execute(cmd, { maxBuffer: undefined });
};

export function formatArgs(params: string[]): string {
  const containsInt = params.some((param) =>
    param.match(/i8|i16|i32|i64|i128/g)
  );
  if (containsInt) {
    return `-- -- ${params.map((s) => `"${s}"`).join(' ')}`;
  }
  return params.map((s) => `"${s}"`).join(' ')
}

export function isDefined(v: any) {
  return v !== null && v !== undefined;
}

export function decryptOutput(
  transaction: TransactionModel,
  transitionName: string,
  programName: string,
  privateKey: string,
  network: string
): Optional<Array<Record<string, unknown>>> {
  if (!transaction.execution.transitions) return [];
  const transitions = transaction.execution.transitions.filter(
    (transition) => transition.function == transitionName
  );
  if (transitions.length === 0) return [];

  const transition = transitions.filter(
    (transition) => transition.program == programName
  );
  if (transition.length == 0) return [];

  const offset = transition[0].inputs ? transition[0].inputs.length : 0;
  if (transition[0].outputs) {
    const outputs = transition[0].outputs.map(
      (output: Output, index: number) => {
        let val = output.value;
        if (output.type == 'private') {
          val = Decrypter.get_decrypted_value(
            output.value,
            programName,
            transitionName,
            offset + index,
            privateKey,
            transition[0].tpk,
            network
          );
        } else if (output.type == 'record') {
          val = output.value;
        } else if (output.type == 'external_record') {
          return { external_record: '' };
        }
        return parseJSONLikeString(val);
      }
    );
    return outputs;
  }
  return undefined;
}
