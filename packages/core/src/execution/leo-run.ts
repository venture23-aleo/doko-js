import { ContractConfig, LeoTransactionParams } from './types';
import { ExecutionContext, ExecutionOutput } from './types';
import { ExecutionOutputParser, StdoutResponseParser } from './output-parser';
import { formatArgs, execute } from './execution-helper';
import {
  LeoRunResponse,
  TransactionResponse
} from '@/leo-types/transaction/transaction-response';
import { TransactionModel } from '@aleohq/sdk';

export class LeoRunContext implements ExecutionContext {
  constructor(
    public params: LeoTransactionParams,
    public parser: StdoutResponseParser = new StdoutResponseParser()
  ) {}

  async execute(
    transitionName: string,
    args: string[]
  ): Promise<TransactionResponse> {
    const transitionArgs = formatArgs(args);
    const command = `cd ${this.params.contractPath} && leo run ${transitionName} ${transitionArgs}`;
    const { stdout } = await execute(command);
    const output = this.parser.parse(stdout);
    return new LeoRunResponse(output.data);
  }
}
