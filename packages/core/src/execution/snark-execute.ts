import { Transaction } from '@provablehq/sdk';
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
  private async broadcast(transaction: Transaction, endpoint: string) {
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
    let cmd = '';
    if (nodeEndPoint === 'http://localhost:3030')
      cmd = `${cdCmd}leo execute ${programName}/${transitionName} ${transitionArgs} --network ${this.params.networkName} --private-key ${this.params.privateKey} --endpoint ${nodeEndPoint} --broadcast --yes  --blocks-to-check 8 --print --devnet --consensus-version 0,1,2,3,4,5,6,7,8,999999`;
    else
      cmd = `${cdCmd}leo execute ${programName}/${transitionName} ${transitionArgs} --network ${this.params.networkName} --private-key ${this.params.privateKey} --endpoint ${nodeEndPoint} --broadcast --yes  --blocks-to-check 8 --print`;
    DokoJSLogger.debug(cmd);
    let stdoutG: string;
    const id: string | null = null;
    try {
      const { stdout } = await execute(cmd);
      stdoutG = stdout;
    } catch (error: any) {
      stdoutG = error.message;
    }

    const transaction = extractTransactionId(stdoutG);
    if (transaction) {
      return new SnarkExecuteResponse(
        transaction as string,
        this.params,
        transitionName
      );
    } else
      throw new DokoJSError(ERRORS.NETWORK.INVALID_TRANSACTION_OBJECT, {
        transitionName
      });
  }
}

export function extractTransactionId(output: string): string | null {
  const regex = /transaction ID:\s*['"]([^'"]+)['"]/i;
  const match = output.match(regex);
  return match ? match[1] : null;
}

// export const waitTransaction = async (
//   transactionId: string,
//   endpoint: string,
//   networkName: string
// ) => {
//   if (transactionId)
//     return await validateBroadcast(transactionId, endpoint, networkName);
//   return null;
// };
