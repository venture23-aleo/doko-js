import { ExecutionMode, LeoTransactionParams, TransactionParams } from "./transaction-model";
import { SnarkStdoutResponseParser, StdoutResponseParser } from "./transaction-parser";
import { LeoExecuteResponse, LeoRunResponse, SnarkExecuteResponse, TransactionResponse } from "./transaction-response";
import { post } from "@/utils/httpRequests";

import { promisify } from 'util';
import { exec } from 'child_process'
import { ContractConfig } from "./transaction-model";
import { TransactionModel } from "@aleohq/sdk";

// @TODO replace this with shell
const _execute = promisify(exec);
const execute = (cmd: string) => {
    return _execute(cmd, { maxBuffer: undefined });
}

// Execute the transaction and return response
export interface ExecutionContext {
    execute: (transition: string, args: string[]) => Promise<TransactionResponse>;
}

function formatArgs(params: string[]): string {
    return params.map((s) => `"${s}"`).join(' ');
}

class LeoRunContext implements ExecutionContext {

    constructor(public params: LeoTransactionParams, public parser: StdoutResponseParser) {
    }

    async execute(transitionName: string, args: string[]): Promise<TransactionResponse> {
        const transitionArgs = formatArgs(args);
        const command = `cd ${this.params.contractPath} && leo run ${transitionName} ${transitionArgs}`;
        const { stdout } = await execute(command);
        const output = this.parser.parse(stdout);
        return new LeoRunResponse(output.data);
    }
}

class LeoExecuteContext implements ExecutionContext {
    constructor(public params: TransactionParams, public parser: StdoutResponseParser) {
    }

    async execute(transitionName: string, args: string[]): Promise<TransactionResponse> {
        const transitionArgs = formatArgs(args);
        const command = `cd ${this.params.contractPath} && leo execute ${transitionName} ${transitionArgs}`;
        const { stdout } = await execute(command);
        const output = this.parser.parse(stdout);
        if (output.transaction)
            return new LeoExecuteResponse(output.transaction, this.params, transitionName);
        else
            throw new Error('Invalid transaction object');
    }
}


class SnarkExecuteContext implements ExecutionContext {

    constructor(public params: TransactionParams, public parser: SnarkStdoutResponseParser) {

    }

    private async broadcast(transaction: TransactionModel, endpoint: string) {
        try {
            return await post(`${endpoint}/testnet3/transaction/broadcast`, {
                body: JSON.stringify(transaction),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (err) {
            console.error(err);
        }
    }

    async execute(transitionName: string, args: string[]): Promise<TransactionResponse> {
        const nodeEndPoint = this.params.network?.endpoint;
        if (!nodeEndPoint) {
            throw new Error('networkName missing in contract config for deployment');
        }

        const programName = this.params.appName + '.aleo';
        const transitionArgs = formatArgs(args);
        // snarkos developer execute sample_program.aleo main  "1u32" "2u32" --private-key APrivateKey1zkp8CZNn3yeCseEtxuVPbDCwSyhGW6yZKUYKfgXmcpoGPWH --query "http://localhost:3030" --broadcast "http://localhost:3030/testnet3/transaction/broadcast"
        // const cmd = `cd ${config.contractPath} && snarkos developer execute  ${config.appName}.aleo ${transition} ${stringedParams} --private-key ${config.privateKey} --query ${nodeEndPoint} --broadcast "${nodeEndPoint}/testnet3/transaction/broadcast"`;
        const cmd = `cd ${this.params.contractPath} && snarkos developer execute ${programName} ${transitionName} ${transitionArgs} --private-key ${this.params.privateKey} --query ${nodeEndPoint} --dry-run`;
        console.log(cmd);

        const { stdout } = await execute(cmd);
        const { transaction } = this.parser.parse(stdout);
        if (transaction) {
            await this.broadcast(transaction, nodeEndPoint);
            return new SnarkExecuteResponse(transaction, this.params, transitionName);
        }
        else
            throw new Error('Invalid transaction object');
    }
}

// @TODO check this later
export function CreateExecutionContext(config: ContractConfig): ExecutionContext {
    const params: TransactionParams = {
        contractPath: config.contractPath,
        appName: config.appName,
        privateKey: config.privateKey,
        network: { endpoint: config.network.endpoint },
        networkName: config.networkName
    }
    switch (config.mode) {
        case ExecutionMode.LeoExecute:
            return new LeoExecuteContext(params, new StdoutResponseParser());
        case ExecutionMode.SnarkExecute:
            return new SnarkExecuteContext(params, new SnarkStdoutResponseParser());
        case ExecutionMode.LeoRun:
        default:
            return new LeoRunContext(params, new StdoutResponseParser());
    }
}