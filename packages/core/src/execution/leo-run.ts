import { LeoTransactionParams } from './types';
import { ExecutionContext } from './types';
import { StdoutResponseParser } from './output-parser';
import { TransactionResponse } from '@/leo-types/transaction/transaction-response';
import { LeoCommand, LeoCommandType } from '@/command';

export class LeoRunContext implements ExecutionContext {
  constructor(
    public params: LeoTransactionParams,
    public parser: StdoutResponseParser = new StdoutResponseParser()
  ) {}

  async execute(
    transitionName: string,
    args: string[]
  ): Promise<TransactionResponse> {
    return new LeoCommand(this.params)
      .changeDir(this.params.contractPath)
      .executeCmd(LeoCommandType.Run, [transitionName, ...args]);
  }
}
