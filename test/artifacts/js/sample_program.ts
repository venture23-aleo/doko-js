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
import * as receipt from "./transitions/sample_program";

export class Sample_programContract extends BaseContract {

  constructor(config: Partial < ContractConfig > = {
    mode: ExecutionMode.LeoRun
  }) {
    super({
      ...config,
      appName: 'sample_program',
      contractPath: 'artifacts/leo/sample_program',
      networkMode: config.networkName === 'testnet' ? 1 : 0,
      fee: '0.01'
    });
  }
  async main(r0: number, r1: number): Promise < [number, TransactionResponse & receipt.Sample_programMainTransition] > {
    const r0Leo = js2leo.u32(r0);
    const r1Leo = js2leo.u32(r1);

    const params = [r0Leo, r1Leo]
    const result = await this.ctx.execute('main', params);
    const out0 = leo2js.u32(result.outputs[0] as string);
    return [out0, result];
  }


}