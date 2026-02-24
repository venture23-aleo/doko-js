// @TODO replace this with shell
import { Output, Transaction } from '@provablehq/sdk';
import { Decrypter } from '@doko-js/wasm';
import { exec } from 'child_process';
import { promisify } from 'util';
import { parseJSONLikeString } from './utils';
import { Optional } from './types';

import { Ciphertext, PrivateKey, Group } from '@provablehq/sdk';
export function decrypter(
  cipherText: string,
  transitionPublicKey: string,
  privateKey: string,
  programName: string,
  transitionName: string,
  index: number
) {
  const pk = PrivateKey.from_string(privateKey);
  const tpk = Group.fromString(transitionPublicKey);
  const newCipher = Ciphertext.fromString(cipherText);
  const vk = pk.to_view_key();
  const decrypted = newCipher.decryptWithTransitionInfo(
    vk,
    tpk,
    programName,
    transitionName,
    index
  );
  return decrypted.toString();
}

const _execute = promisify(exec);
export const execute = (cmd: string) => {
  return _execute(cmd, { maxBuffer: undefined });
};

export function formatArgs(params: string[]): string {
  return params.map((s) => `"${s}"`).join(' ');
}

export function isDefined(v: any) {
  return v !== null && v !== undefined;
}

export function decryptOutput(
  transaction: Transaction,
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
          val = decrypter(
            output.value,
            transition[0].tpk,
            privateKey,
            programName,
            transitionName,
            offset + index
          );
          // Decrypter.get_decrypted_value(
          //   output.value,
          //   programName,
          //   transitionName,
          //   offset + index,
          //   privateKey,
          //   transition[0].tpk,
          //   network
          // );
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
