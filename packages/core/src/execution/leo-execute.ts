import { ContractConfig, TransactionParams } from './types';
import { ExecutionContext, ExecutionOutput } from './types';
import { ExecutionOutputParser, StdoutResponseParser } from './output-parser';
import { formatArgs, execute, decryptOutput } from './execution-helper';
import {
  LeoExecuteResponse,
  TransactionResponse
} from '@/leo-types/transaction/transaction-response';
import { DokoJSError, ERRORS } from '@doko-js/utils';

export class LeoExecuteContext implements ExecutionContext {
  constructor(
    public params: TransactionParams,
    public parser: StdoutResponseParser = new StdoutResponseParser()
  ) {}

  async execute(
    transitionName: string,
    args: string[]
  ): Promise<TransactionResponse> {
    const transitionArgs = formatArgs(args);
    const command = `cd ${this.params.contractPath} && leo execute ${transitionName} ${transitionArgs}`;
    const { stdout } = await execute(command);
    const output = this.parser.parse(stdout);
    if (output.transaction)
      return new LeoExecuteResponse(
        output.transaction as any,
        this.params,
        transitionName
      );
    else
      throw new DokoJSError(ERRORS.NETWORK.INVALID_TRANSACTION_OBJECT, {
        transitionName
      });
  }
}
