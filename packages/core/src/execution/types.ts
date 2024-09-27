import { TransactionModel } from '@aleohq/sdk';
import { tx } from '@/outputs';
import { TransactionResponse } from '@/leo-types/transaction/transaction-response';

export enum ExecutionMode {
  LeoRun,
  LeoExecute,
  SnarkExecute
}

interface NetworkConfig {
  endpoint: string;
}

export interface ExecutionOutput {
  data: any;
  transaction?: TransactionModel & tx.Receipt;
}

export interface BaseConfig {
  contractPath: string;
  appName: string;
  network: NetworkConfig;
  networkName: string;
  privateKey: string;
  networkMode: number;
}

export interface ContractConfig extends BaseConfig {
  fee?: string;
  mode?: ExecutionMode;
  priorityFee?: number;
  isImportedAleo?: boolean;
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
  Pick<ContractConfig, 'isImportedAleo'>;

export type Optional<T> = T | undefined;
