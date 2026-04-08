import { Transaction } from '@provablehq/sdk';
import { tx } from '@/outputs';
import { TransactionResponse } from '@/leo-types/transaction/transaction-response';

export enum ExecutionMode {
  LeoRun,
  LeoExecute_Deprecated,
  SnarkExecute
}

interface NetworkConfig {
  network: string;
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
  skipProof: boolean;
}

export interface ContractConfig extends BaseConfig {
  fee?: string;
  mode?: ExecutionMode;
  priorityFee?: number;
  isImportedAleo?: boolean;
  isDevnet?: boolean;
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
