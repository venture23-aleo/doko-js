import { TransactionParams } from './types';
import { ExecutionContext } from './types';
import { StdoutResponseParser } from './output-parser';
import { TransactionResponse } from '@/leo-types/transaction/transaction-response';
import { LeoCommand, LeoCommandType } from '@/command';

export class LeoExecuteContext implements ExecutionContext {
  constructor(
    public params: TransactionParams,
    public parser: StdoutResponseParser = new StdoutResponseParser()
  ) {}

  async execute(
    transitionName: string,
    args: string[]
  ): Promise<TransactionResponse> {
    return new LeoCommand(this.params)
      .addBaseCommand('cd')
      .addArgs([this.params.contractPath])
      .chain('&&')
      .executeCmd(LeoCommandType.Execute, [transitionName, ...args]);
  }
}
