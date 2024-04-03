import { BaseRecord } from './record';

export type TxType = 'execute' | 'deploy';

export type PrivateOutput = {
  type: 'private';
  id: string;
  value: string;
};

export type FutureOutput = {
  type: 'future';
  id: string;
  value: string;
};

export type RecordOutput<T extends BaseRecord = BaseRecord> = {
  type: 'record';
  id: string;
  checksum: string;
  value: string;
};

export type ExternalRecordOutput = {
  type: 'external_record';
  id: string;
  value: undefined;
};

export type PublicOutput = {
  type: 'public';
  id: string;
  value: string;
};

export type Output =
  | PrivateOutput
  | FutureOutput
  | RecordOutput
  | ExternalRecordOutput
  | PublicOutput;

export type Transition<
  T extends Array<Output> = Array<Output>,
  P extends string = string,
  F extends string = string
> = {
  id: string;
  program: P;
  function: F;
  inputs: Array<object>;
  outputs: T;
  tpk: string;
  tcm: string;
};

export type BaseReceipt = {
  type?: TxType;
  id: string;
  fee?: {
    transition: Transition<
      Array<Output>,
      'credits.aleo',
      'fee_public' | 'fee_private'
    >;
    global_state_root: string;
    proof: string;
  };
};

export type ExecutionReceipt<T extends Array<Transition> = Array<Transition>> =
  {
    type: 'execute';
    execution: {
      transitions: T;
      global_state_root: string;
      proof: string;
    };
  };

export type Receipt = BaseReceipt & ExecutionReceipt;
