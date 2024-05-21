import { get_decrypted_value } from "aleo-ciphertext-decryptor";
import { Output, TransactionModel } from "@aleohq/sdk";

import { parseRecordString } from "./transaction-parser";
import { TransactionParams } from "./transaction-model";
import { get } from "@/utils/httpRequests";

export interface TransactionResponse {
    // Transaction object created by calling --dry-run locally
    tx0?: TransactionModel;

    // Outputs for the transition for which this object is returned
    outputs: Array<any>;

    // this function poll whether the transaction id is included in chain or not.
    //xthis function return null in LeoRun and LeoExecuteMode.In SnarkExecute mode it
    // returns the transaction object that is obtained from the endpoint
    wait: () => Promise<TransactionModel | null>
    // @TODO add block() function to get the blockHeight at which transaction is included
}

const decryptOutput = (
    transaction: TransactionModel,
    transitionName: string,
    programName: string,
    privateKey: string
): Record<string, unknown>[] => {
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
                }
                return parseRecordString(val);
            }
        );
        return outputs;
    }
    return [];
};

// @TODO get timeout/total retry from the config
const validateBroadcast = async (transactionId: string, nodeEndpoint: string): Promise<TransactionModel | null> => {
    const pollUrl = `${nodeEndpoint}/testnet3/transaction/${transactionId}`;
    const timeoutMs = 60_000;
    const pollInterval = 1000; // 1 second
    const startTime = Date.now();

    console.log(`Validating transaction: ${pollUrl}`);
    while (Date.now() - startTime < timeoutMs) {
        try {
            const response = await get(pollUrl);
            const data = await response.json() as TransactionModel & { deployment: any };
            if (!data.execution && !data.deployment) {
                console.error('Transaction error');
            }
            return data;
        } catch (e: any) {
            await new Promise((resolve) => setTimeout(resolve, pollInterval));
            console.log('Retrying: ', e.message);
        }
    }
    console.log('Timeout');
    return null;
}

export class LeoRunResponse implements TransactionResponse {

    tx0?: TransactionModel;
    outputs: Record<string, unknown>[];
    constructor(outputs: Record<string, unknown>[]) {
        this.outputs = outputs;
    }

    async wait(): Promise<TransactionModel | null> {
        return null;
    }
}

export class LeoExecuteResponse implements TransactionResponse {

    tx0?: TransactionModel;
    outputs: Record<string, unknown>[];

    constructor(transaction: TransactionModel, transactionParam: TransactionParams, transitionName: string) {
        this.tx0 = transaction;

        const program = transactionParam.appName + '.aleo';
        this.outputs = decryptOutput(transaction, transitionName, program, transactionParam.privateKey);
    }

    async wait(): Promise<TransactionModel | null> {
        return null;
    }
}

export class SnarkExecuteResponse extends LeoExecuteResponse {
    private transactionParams: TransactionParams;
    constructor(transaction: TransactionModel, transactionParam: TransactionParams, transitionName: string) {
        super(transaction, transactionParam, transitionName);
        this.transactionParams = transactionParam;
    }


    async wait(): Promise<TransactionModel | null> {
        const endpoint = this.transactionParams.network.endpoint;
        if (!endpoint)
            throw new Error('Endpoint is not valid');

        const transactionId = this.tx0?.id;
        if (transactionId)
            return await validateBroadcast(transactionId, endpoint);
        else return null;
    }
}

export class SnarkDeployResponse implements TransactionResponse {
    private transactionParams: TransactionParams;
    outputs: Array<string> = [];
    tx0: TransactionModel;

    constructor(transaction: TransactionModel, transactionParam: TransactionParams) {
        this.tx0 = transaction;
        this.transactionParams = transactionParam;
    }

    async wait(): Promise<TransactionModel | null> {
        const endpoint = this.transactionParams.network.endpoint;
        if (!endpoint)
            throw new Error('Endpoint is not valid');

        const transactionId = this.tx0?.id;
        if (transactionId)
            return await validateBroadcast(transactionId, endpoint);
        else return null;
    }
}