import { SnarkExecuteTransactionParams } from './types';
import { ExecutionContext, ExecutionOutput } from './types';
import {
  ExecutionOutputParser,
  SnarkStdoutResponseParser
} from './output-parser';
import { formatArgs, execute, decryptOutput } from './execution-helper';
import { broadcastTransaction } from './utils';
import { TransactionModel } from '@aleohq/sdk';
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
      console.error(err);
    }
  }

  async execute(
    transitionName: string,
    args: string[]
  ): Promise<TransactionResponse> {
    const nodeEndPoint = this.params.network?.endpoint;
    if (!nodeEndPoint) {
      throw new Error('networkName missing in contract config for deployment');
    }

    const programName = this.params.appName + '.aleo';
    const transitionArgs = formatArgs(args);
    const cdCmd = this.params.isImportedAleo
      ? ''
      : `cd ${this.params.contractPath} && `;
    // snarkos developer execute sample_program.aleo main  "1u32" "2u32" --private-key APrivateKey1zkp8CZNn3yeCseEtxuVPbDCwSyhGW6yZKUYKfgXmcpoGPWH --query "http://localhost:3030" --broadcast "http://localhost:3030/testnet3/transaction/broadcast"
    // const cmd = `cd ${config.contractPath} && snarkos developer execute  ${config.appName}.aleo ${transition} ${stringedParams} --private-key ${config.privateKey} --query ${nodeEndPoint} --broadcast "${nodeEndPoint}/testnet3/transaction/broadcast"`;
    // const cmd = `cd ${this.params.contractPath} && snarkos developer execute ${programName} ${transitionName} ${transitionArgs} --network ${this.params.networkMode} --private-key ${this.params.privateKey} --query ${nodeEndPoint} --dry-run`;
    const cmd = `${cdCmd}snarkos developer execute ${programName} ${transitionName} ${transitionArgs} --private-key ${this.params.privateKey} --query ${nodeEndPoint} --dry-run`;
    console.log(cmd);

    const { stdout } = await execute(cmd);
    const { transaction } = this.parser.parse(stdout);
    if (transaction) {
      await this.broadcast(transaction, nodeEndPoint);
      return new SnarkExecuteResponse(transaction, this.params, transitionName);
    } else throw new Error('Invalid transaction object');
  }
}
