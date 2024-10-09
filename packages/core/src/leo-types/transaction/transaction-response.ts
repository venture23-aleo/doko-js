import { decryptOutput } from '@/execution/execution-helper';
import { validateBroadcast } from '@/execution';
import { TransactionParams } from '@/execution';
import { get } from '@/utils/httpRequests';
import { DokoJSError, ERRORS } from '@doko-js/utils';
import { Optional } from '@/execution';
import { TransactionModel } from '@provablehq/sdk';

type Tuple = Optional<Array<unknown>>;
type ConverterFn = (val: any, rest?: any) => any;
type ConverterFnDefinition = [ConverterFn, ...string[]];

export abstract class TransactionResponse<
  TransactionDefinition extends TransactionModel = TransactionModel,
  Result = Tuple
> {
  // Outputs for the transition for which this object is returned
  outputs: Optional<Array<Record<string, unknown>>>;
  converterFns: Optional<Array<ConverterFn | ConverterFnDefinition>>;
  // this function poll whether the transaction id is included in chain or not.
  // this function return null in LeoRun and LeoExecuteMode.In SnarkExecute mode it
  // returns the transaction object that is obtained from the endpoint
  abstract wait(): Promise<Result>;

  // set_converter_fn takes input in form of array of tuples
  // For e.g if the output is expected to be number and string then
  // we can set converter as [leo2js.number, leo2js.string]
  // However in case of array we have to represent something like
  // leo2js.array(arrays, leo2js.u32) (where second arg specifies that the array is to interpreted
  // as u32)
  // this should be passed as [[leo2js.array, leo2js.u32], leo2js.string] where starting from second elements in
  // the tuples are interpreted as argument to function which is first element of tuple
  set_converter_fn(converters: Array<ConverterFn | ConverterFnDefinition>) {
    this.converterFns = converters;
  }

  // @TODO add block() function to get the blockHeight at which transaction is included
  async blockHeight(): Promise<Optional<string>> {
    return undefined;
  }

  async getTransaction(): Promise<TransactionDefinition | null> {
    return null;
  }

  protected apply_converters(): Result {
    if (!this.outputs) return undefined as Result;

    const outputValues = Array.from(this.outputs.values());
    if (this.converterFns && outputValues) {
      const result: Tuple = [];
      for (let i = 0; i < this.converterFns.length; ++i) {
        const functionInfo = this.converterFns![i];
        if (Array.isArray(functionInfo)) {
          result.push(functionInfo[0](this.outputs[i], functionInfo[1]));
        } else result.push(functionInfo(this.outputs[i]));
      }
      return result as Result;
    } else {
      return Array.from(outputValues.values()) as Result;
    }
  }
}

export class LeoRunResponse<
  TransactionDefinition extends TransactionModel,
  Result extends Tuple = Tuple
> extends TransactionResponse<TransactionDefinition, Result> {
  constructor(outputs: Record<string, unknown>[]) {
    super();
    this.outputs = outputs;
  }

  async wait(): Promise<Result> {
    return this.apply_converters();
  }
}

export class LeoExecuteResponse<
  TransactionDefinition extends TransactionModel = TransactionModel,
  Result extends Tuple = Tuple
> extends TransactionResponse<TransactionDefinition, Result> {
  transaction: TransactionDefinition;

  constructor(
    transaction: TransactionDefinition,
    transactionParam: TransactionParams,
    transitionName: string
  ) {
    super();
    this.transaction = transaction;

    const program = transactionParam.appName + '.aleo';
    this.outputs = decryptOutput(
      transaction,
      transitionName,
      program,
      transactionParam.privateKey,
      transactionParam.networkName
    );
  }

  async wait(): Promise<Result> {
    return this.apply_converters();
  }

  async blockHeight() {
    return undefined;
  }

  async getTransaction(): Promise<TransactionDefinition | null> {
    return this.transaction;
  }
}

export class SnarkExecuteResponse<
  TransactionDefinition extends TransactionModel = TransactionModel,
  Result extends Tuple = Tuple
> extends TransactionResponse<TransactionDefinition, Result> {
  protected transaction: TransactionDefinition | null;

  constructor(
    protected transactionId: string,
    protected transactionParams: TransactionParams,
    protected transitionName: string
  ) {
    super();
    this.transaction = null;
  }

  async wait(): Promise<Result> {
    const endpoint = this.transactionParams.network.endpoint;
    if (!endpoint)
      throw new DokoJSError(ERRORS.NETWORK.EMPTY_URL, { value: 'endpoint' });

    this.transaction = (await validateBroadcast(
      this.transactionId,
      endpoint,
      this.transactionParams.networkName
    )) as any;

    if (this.transaction) {
      const program = this.transactionParams.appName + '.aleo';
      const { privateKey, networkName } = this.transactionParams;
      this.outputs = decryptOutput(
        this.transaction,
        this.transitionName,
        program,
        privateKey,
        networkName
      );
    }
    return this.apply_converters();
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

  async getTransaction(): Promise<TransactionDefinition | null> {
    if (this.transaction) return this.transaction;

    this.transaction = (await validateBroadcast(
      this.transactionId,
      this.transactionParams.network.endpoint,
      this.transactionParams.networkName
    )) as any;
    return this.transaction;
  }
}

export class SnarkDeployResponse<
  TransactionDefinition extends TransactionModel = TransactionModel,
  Result extends Tuple = Tuple
> extends SnarkExecuteResponse<TransactionDefinition, Result> {
  constructor(transactionId: string, transactionParams: TransactionParams) {
    super(transactionId, transactionParams, '');
  }

  async wait(): Promise<Result> {
    const endpoint = this.transactionParams.network.endpoint;
    if (!endpoint)
      throw new DokoJSError(ERRORS.NETWORK.EMPTY_URL, { value: 'endpoint' });

    if (this.transactionId) {
      this.transaction = (await validateBroadcast(
        this.transactionId,
        endpoint,
        this.transactionParams.networkName
      )) as any;
    }
    return undefined as Result;
  }
  /*
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
    */
}
