import { TransactionModel } from '@provablehq/sdk';
import { DokoJSError, DokoJSLogger, ERRORS } from '@doko-js/utils';

import { SnarkExecuteTransactionParams, ExecutionContext } from './types';
import { SnarkStdoutResponseParser } from './output-parser';
import { formatArgs, execute } from './execution-helper';
import { post } from '@/utils/httpRequests';
import {
  SnarkExecuteResponse,
  TransactionResponse
} from '@/leo-types/transaction/transaction-response';

export class SnarkExecuteContext implements ExecutionContext {
  constructor(
    public params: SnarkExecuteTransactionParams,
    public parser: SnarkStdoutResponseParser = new SnarkStdoutResponseParser()
  ) {}
  /*
  private async broadcast(transaction: TransactionModel, endpoint: string) {
    try {
      return await post(
        `${endpoint}/${this.params.networkName}/transaction/broadcast`,
        {
          body: JSON.stringify(transaction),
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (err) {
      DokoJSLogger.error(err);
    }
  }
  */
  async execute(
    transitionName: string,
    args: string[]
  ): Promise<TransactionResponse> {
    const nodeEndPoint = this.params.network?.endpoint;
    if (!nodeEndPoint) {
      throw new DokoJSError(ERRORS.VARS.VALUE_NOT_FOUND_FOR_VAR, {
        value: 'networkName'
      });
    }

    const transitionArgs = formatArgs(args);
    const cdCmd = this.params.isImportedAleo
      ? ''
      : `cd ${this.params.contractPath} && `;

    const programName = this.params.appName + '.aleo';
    const cmd = `${cdCmd}leo execute --program ${programName} ${transitionName} ${transitionArgs} --network ${this.params.networkName} --private-key ${this.params.privateKey} --endpoint ${nodeEndPoint} --broadcast --yes`;
    DokoJSLogger.debug(cmd);

    const { stdout } = await execute(cmd);
    const { transaction } = this.parser.parse(stdout);
    if (transaction) {
      return new SnarkExecuteResponse(
        transaction.id,
        this.params,
        transitionName
      );
    } else
      throw new DokoJSError(ERRORS.NETWORK.INVALID_TRANSACTION_OBJECT, {
        transitionName
      });
  }
}
