// @TODO replace this with shell
import { tx } from "@/outputs";
import { Output, TransactionModel } from "@aleohq/sdk";
import { get_decrypted_value } from "aleo-ciphertext-decryptor"
import { exec } from "child_process"
import { promisify } from "util";
import { parseJSONLikeString } from "./utils";

const _execute = promisify(exec);
export const execute = (cmd: string) => {
    return _execute(cmd, { maxBuffer: undefined });
}

export function formatArgs(params: string[]): string {
    return params.map((s) => `"${s}"`).join(' ');
}

export function isDefined(v: any) {
    return v !== null && v !== undefined;
}

export function decryptOutput(
    transaction: TransactionModel,
    transitionName: string,
    programName: string,
    privateKey: string
) {
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
                    val = get_decrypted_value(
                        output.value,
                        programName,
                        transitionName,
                        offset + index,
                        privateKey,
                        transition[0].tpk
                    );
                } else if (output.type == 'record') {
                    val = output.value;
                } else if (output.type == 'external_record') {
                    return null;
                }
                return parseJSONLikeString(val);
            }
        );
        return outputs;
    }
    return [];
};