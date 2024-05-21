import { TransactionModel } from "@aleohq/sdk";

interface NetworkConfig {
    endpoint: string;
}
export interface BaseConfig {
    contractPath: string;
    appName: string;
    network: NetworkConfig;
    networkName: string;
    privateKey: string;
}

export enum ExecutionMode {
    LeoRun,
    LeoExecute,
    SnarkExecute
}

export interface ContractConfig extends BaseConfig {
    fee?: string;
    mode?: ExecutionMode;
    priorityFee?: number;
}
export interface TransactionParams extends BaseConfig {
}

export type LeoTransactionParams = Omit<TransactionParams, 'network' | 'networkName'>

export interface AleoExecutionOutput {
    data: Record<string, unknown>[],
    transaction?: TransactionModel
}
