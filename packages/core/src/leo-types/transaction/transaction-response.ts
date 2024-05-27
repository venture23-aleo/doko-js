import { get_decrypted_value } from "aleo-ciphertext-decryptor";
import { Output, TransactionModel } from "@aleohq/sdk";

import { decryptOutput } from "@/execution/execution-helper";
import {validateBroadcast} from "@/execution";
import { TransactionParams } from "@/execution";
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
    outputs: (Record<string, unknown> | null)[];

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
            return await validateBroadcast(transactionId, endpoint, this.transactionParams.networkName);
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
            return await validateBroadcast(transactionId, endpoint, this.transactionParams.networkName);
        else return null;
    }
}