import {
  credits
} from "./types/credits";
import {
  getcreditsLeo
} from "./js2leo/credits";
import {
  getcredits
} from "./leo2js/credits";
import {
  ContractConfig,
  zkGetMapping,
  LeoAddress,
  LeoRecord,
  js2leo,
  leo2js,
  ExternalRecord,
  ExecutionMode,
  ExecutionContext,
  CreateExecutionContext,
  TransactionResponse
} from "@doko-js/core";
import {
  BaseContract
} from "../../contract/base-contract";
import * as receipt from "./transitions/credits";

export class CreditsContract extends BaseContract {

  constructor(config: Partial < ContractConfig > = {
    mode: ExecutionMode.LeoRun
  }) {
    super({
      ...config,
      appName: 'credits',
      contractPath: 'artifacts/leo/credits',
      networkMode: config.networkName === 'testnet' ? 1 : 0,
      fee: '0.01'
    });
  }
  async mint(r0: LeoAddress, r1: bigint): Promise < [LeoRecord, TransactionResponse & receipt.CreditsMintTransition] > {
    const r0Leo = js2leo.address(r0);
    const r1Leo = js2leo.u64(r1);

    const params = [r0Leo, r1Leo]
    const result = await this.ctx.execute('mint', params);
    const out0 = (this.config.mode === ExecutionMode.LeoRun) ? JSON.stringify(result.outputs[0]) : result.outputs[0];
    return [out0, result];
  }

  async transfer_private(r0: credits, r1: LeoAddress, r2: bigint): Promise < [LeoRecord, LeoRecord, TransactionResponse & receipt.CreditsTransfer_privateTransition] > {
    const r0Leo = js2leo.json(getcreditsLeo(r0));
    const r1Leo = js2leo.address(r1);
    const r2Leo = js2leo.u64(r2);

    const params = [r0Leo, r1Leo, r2Leo]
    const result = await this.ctx.execute('transfer_private', params);
    const out0 = (this.config.mode === ExecutionMode.LeoRun) ? JSON.stringify(result.outputs[0]) : result.outputs[0];
    const out1 = (this.config.mode === ExecutionMode.LeoRun) ? JSON.stringify(result.outputs[1]) : result.outputs[1];
    return [out0, out1, result];
  }

  async join(r0: credits, r1: credits): Promise < [LeoRecord, TransactionResponse & receipt.CreditsJoinTransition] > {
    const r0Leo = js2leo.json(getcreditsLeo(r0));
    const r1Leo = js2leo.json(getcreditsLeo(r1));

    const params = [r0Leo, r1Leo]
    const result = await this.ctx.execute('join', params);
    const out0 = (this.config.mode === ExecutionMode.LeoRun) ? JSON.stringify(result.outputs[0]) : result.outputs[0];
    return [out0, result];
  }

  async split(r0: credits, r1: bigint): Promise < [LeoRecord, LeoRecord, TransactionResponse & receipt.CreditsSplitTransition] > {
    const r0Leo = js2leo.json(getcreditsLeo(r0));
    const r1Leo = js2leo.u64(r1);

    const params = [r0Leo, r1Leo]
    const result = await this.ctx.execute('split', params);
    const out0 = (this.config.mode === ExecutionMode.LeoRun) ? JSON.stringify(result.outputs[0]) : result.outputs[0];
    const out1 = (this.config.mode === ExecutionMode.LeoRun) ? JSON.stringify(result.outputs[1]) : result.outputs[1];
    return [out0, out1, result];
  }

  async fee(r0: credits, r1: bigint): Promise < [LeoRecord, TransactionResponse & receipt.CreditsFeeTransition] > {
    const r0Leo = js2leo.json(getcreditsLeo(r0));
    const r1Leo = js2leo.u64(r1);

    const params = [r0Leo, r1Leo]
    const result = await this.ctx.execute('fee', params);
    const out0 = (this.config.mode === ExecutionMode.LeoRun) ? JSON.stringify(result.outputs[0]) : result.outputs[0];
    return [out0, result];
  }

  async account(key: LeoAddress, defaultValue ? : bigint): Promise < bigint > {
    const keyLeo = js2leo.address(key);

    const params = [keyLeo]
    const result = await zkGetMapping(
      this.config,
      'account',
      params[0],
    );

    if (result != null)
      return leo2js.u64(result);
    else {
      if (defaultValue != undefined) return defaultValue;
      throw new Error(`account returned invalid value[input: ${key}, output: ${result}`);
    }
  }


}