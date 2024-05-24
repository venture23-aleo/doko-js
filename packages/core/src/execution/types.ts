import { TransactionModel } from "@aleohq/sdk";
import { tx } from '@/outputs';

export enum ExecutionMode {
    LeoRun,
    LeoExecute,
    SnarkExecute
};

interface NetworkConfig {
    endpoint: string;
}

export interface ExecutionOutput {
    data: any;
    transaction?: TransactionModel & tx.Receipt;
}

export interface ContractConfig {
    privateKey?: string;
    viewKey?: string;
    appName?: string;
    contractPath?: string;
    fee?: string;
    network?: NetworkConfig;
    networkName?: string;
    mode?: ExecutionMode;
    priorityFee?: number;
}

export interface ExecutionContext {
    execute(transitionName: string, params: string[]) : Promise<ExecutionOutput>;
}