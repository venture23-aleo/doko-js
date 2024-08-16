import {
  DokoJSError,
  DokoJSLogger,
  ERRORS,
  getAleoConfig
} from '@doko-js/utils';
import { CommandOption, UnixCommandBuilder } from './unix-cmd-builder';
import { LeoTransactionParams, TransactionParams } from '@/execution';
import { LeoExecuteResponse, LeoRunResponse } from '@/leo-types';

enum LeoCommandType {
  New = 'new',
  Run = 'run',
  Execute = 'execute',
  Build = 'build'
}

class LeoCommand extends UnixCommandBuilder {
  private baseCommand: string = 'leo';
  private defaultOptions: Array<CommandOption> | undefined;

  constructor(
    private params?: LeoTransactionParams,
    options?: Array<CommandOption>
  ) {
    super();
    this.defaultOptions = options;
  }

  static async default(
    network?: string,
    config?: LeoTransactionParams
  ): Promise<LeoCommand> {
    const leoVersion = await new LeoCommand().version();

    let resolvedNetwork = network;
    if (!resolvedNetwork) {
      const aleoConfig = await getAleoConfig();
      resolvedNetwork = aleoConfig['defaultNetwork'];
    }

    const networkFlag =
      resolvedNetwork && leoVersion.startsWith('2.')
        ? [{ key: '--network', value: resolvedNetwork }]
        : undefined;

    return new LeoCommand(config, networkFlag);
  }

  async version(): Promise<string> {
    const cmd = this.addBaseCommand(this.baseCommand).addFlags(['-V']).build();
    const output = await super.execute(cmd, false);
    const outputStr = typeof output === 'string' ? output : '';
    const searchResult = /leo (?<version>\d+\.\d+\.\d+)/.exec(outputStr);
    return searchResult?.groups?.version || '';
  }

  build(): string {
    if (this.defaultOptions) {
      this.addOptions(this.defaultOptions);
    }
    return super.build();
  }

  async executeCmd(
    type: LeoCommandType,
    args: string[],
    shell?: boolean,
    options: Array<CommandOption> = []
  ): Promise<LeoExecuteResponse | LeoRunResponse | any> {
    const cmd = this.addBaseCommand(this.baseCommand)
      .addArgs([type, ...args])
      .addOptions(options)
      .build();

    if (!cmd) throw new Error('No command to execute');

    const res = await super.execute(cmd, shell);

    if (res && typeof res === 'object' && 'transaction' in res) {
      const { transaction, data } = res as { transaction: any; data: any };
      switch (type) {
        case LeoCommandType.Execute:
          return new LeoExecuteResponse(transaction, this.params!, args[0]);
        case LeoCommandType.Run:
          return new LeoRunResponse(data);
        default:
          return;
      }
    }

    if (type === LeoCommandType.Execute) {
      throw new DokoJSError(ERRORS.NETWORK.INVALID_TRANSACTION_OBJECT, {
        transitionName: args[0]
      });
    }
    return res;
  }
}

export { LeoCommand, LeoCommandType };
