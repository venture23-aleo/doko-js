import { Transaction } from '@provablehq/sdk';
import { tx } from '@/outputs';
import { TransactionResponse } from '@/leo-types/transaction/transaction-response';

export enum ExecutionMode {
  LeoRun,
  LeoExecute_Deprecated,
  SnarkExecute
}

interface NetworkConfig {
  endpoint: string;
  accounts: string[];
}

export interface ExecutionOutput {
  data: any;
  transaction?: (Transaction & tx.Receipt) | string;
}

export interface BaseConfig {
  contractPath: string;
  appName: string;
  network: NetworkConfig;
  networkName: string;
  privateKey: string;
}

export interface ContractConfig extends BaseConfig {
  fee?: string;
  mode?: ExecutionMode;
  priorityFee?: number;
  isImportedAleo?: boolean;
  isDevnet?: boolean; // Added to indicate if the execution is on devnet
}

export interface ExecutionContext {
  execute(
    transitionName: string,
    params: string[]
  ): Promise<TransactionResponse>;
}

export interface TransactionParams extends BaseConfig {}

export type LeoTransactionParams = Omit<
  TransactionParams,
  'network' | 'networkName'
>;

export type SnarkExecuteTransactionParams = TransactionParams &
  Pick<ContractConfig, 'isImportedAleo' | 'isDevnet'>;

export type Optional<T> = T | undefined;
