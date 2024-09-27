import { TransactionModel } from '@aleohq/sdk';

import { decryptOutput } from '@/execution/execution-helper';
import { validateBroadcast } from '@/execution';
import { TransactionParams } from '@/execution';
import { get } from '@/utils/httpRequests';
import { DokoJSError, ERRORS } from '@doko-js/utils';
import { Tuple, Optional } from '@/execution';

export interface TransactionResponse<T extends Tuple = Tuple> {
  // Outputs for the transition for which this object is returned
  outputs: Optional<Array<Record<string, unknown>>>;

  // this function poll whether the transaction id is included in chain or not.
  //xthis function return null in LeoRun and LeoExecuteMode.In SnarkExecute mode it
  // returns the transaction object that is obtained from the endpoint
  wait: () => Promise<T | void>;
  // @TODO add block() function to get the blockHeight at which transaction is included
  blockHeight: () => Promise<Optional<string>>;

  getTransaction: () => Promise<Optional<TransactionModel>>;
}

export class LeoRunResponse<T extends Tuple> implements TransactionResponse<T> {
  outputs: Optional<Array<Record<string, unknown>>>;
  constructor(outputs: Record<string, unknown>[]) {
    this.outputs = outputs;
  }

  async wait(): Promise<T | void> {
    if (this.outputs && this.outputs.length > 0)
      return Array.from(this.outputs.values()) as T;
  }

  async blockHeight() {
    return undefined;
  }

  async getTransaction() {
    return undefined;
  }
}

export class LeoExecuteResponse<T extends Tuple>
  implements TransactionResponse<T>
{
  outputs: Optional<Array<Record<string, unknown>>>;
  transaction: Optional<TransactionModel>;

  constructor(
    transaction: TransactionModel,
    private transactionParam: TransactionParams,
    private transitionName: string
  ) {
    this.transaction = transaction;

    const program = transactionParam.appName + '.aleo';
    this.outputs = decryptOutput(
      transaction,
      transitionName,
      program,
      transactionParam.privateKey,
      transactionParam.networkMode
    );
  }

  async wait(): Promise<T | void> {
    if (this.outputs && this.outputs.length > 0)
      return Array.from(this.outputs.values()) as T;
  }

  async blockHeight() {
    return undefined;
  }

  async getTransaction() {
    return this.transaction;
  }
}

export class SnarkExecuteResponse<T extends Tuple>
  implements TransactionResponse<T>
{
  outputs: Optional<Array<Record<string, unknown>>>;
  transaction: Optional<TransactionModel>;

  constructor(
    private transactionId: string,
    private transactionParams: TransactionParams,
    private transitionName: string
  ) {}

  async wait(): Promise<T | void> {
    const endpoint = this.transactionParams.network.endpoint;
    if (!endpoint)
      throw new DokoJSError(ERRORS.NETWORK.EMPTY_URL, { value: 'endpoint' });

    this.transaction = await validateBroadcast(
      this.transactionId,
      endpoint,
      this.transactionParams.networkName
    );

    if (this.transaction) {
      const program = this.transactionParams.appName + '.aleo';
      const { privateKey, networkMode } = this.transactionParams;
      this.outputs = decryptOutput(
        this.transaction,
        this.transitionName,
        program,
        privateKey,
        networkMode
      );
    }
  }

  async blockHeight() {
    const transactionId = this.transactionId;
    const nodeEndpoint = this.transactionParams.network.endpoint;
    let pollUrl = `${nodeEndpoint}/${this.transactionParams.networkName}/find/blockHash/${transactionId}`;
    const response = await get(pollUrl);
    const blockHash = await response.json();
    pollUrl = `${nodeEndpoint}/${this.transactionParams.networkName}/height/${blockHash}`;
    const response1 = await get(pollUrl);
    const blockHeight = await response1.json();
    return blockHeight;
  }

  async getTransaction() {
    if (this.transaction) return this.transaction;
    this.transaction = await validateBroadcast(
      this.transactionId,
      this.transactionParams.network.endpoint,
      this.transactionParams.networkName
    );
    return this.transaction;
  }
}

export class SnarkDeployResponse<T extends Tuple>
  implements TransactionResponse<T>
{
  private transaction: Optional<TransactionModel>;
  outputs: Optional<Array<Record<string, unknown>>>;

  constructor(
    private transactionId: string,
    private transactionParams: TransactionParams
  ) {}

  async wait(): Promise<T | void> {
    const endpoint = this.transactionParams.network.endpoint;
    if (!endpoint)
      throw new DokoJSError(ERRORS.NETWORK.EMPTY_URL, { value: 'endpoint' });

    if (this.transactionId) {
      this.transaction = await validateBroadcast(
        this.transactionId,
        endpoint,
        this.transactionParams.networkName
      );
    }
  }

  async blockHeight() {
    const nodeEndpoint = this.transactionParams.network.endpoint;
    let pollUrl = `${nodeEndpoint}/${this.transactionParams.networkName}/find/blockHash/${this.transactionId}`;
    const response = await get(pollUrl);
    const blockHash = await response.json();
    pollUrl = `${nodeEndpoint}/${this.transactionParams.networkName}/height/${blockHash}`;
    const response1 = await get(pollUrl);
    const blockHeight = await response1.json();
    return blockHeight;
  }

  async getTransaction() {
    if (this.transaction) return this.transaction;
    this.transaction = await validateBroadcast(
      this.transactionId,
      this.transactionParams.network.endpoint,
      this.transactionParams.networkName
    );
    return this.transaction;
  }
}
