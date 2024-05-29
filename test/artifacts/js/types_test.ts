import {
  Marks,
  Report_Card,
  Report,
  Counts
} from "./types/types_test";
import {
  getMarksLeo,
  getReport_CardLeo,
  getReportLeo,
  getCountsLeo
} from "./js2leo/types_test";
import {
  getMarks,
  getReport_Card,
  getReport,
  getCounts
} from "./leo2js/types_test";
import {
  credits as credits_credits
} from "./types/credits";
import {
  getcreditsLeo as credits_getcreditsLeo
} from "./js2leo/credits";
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
import * as receipt from "./transitions/types_test";

export class Types_testContract extends BaseContract {

  constructor(config: Partial < ContractConfig > = {
    mode: ExecutionMode.LeoRun
  }) {
    super({
      ...config,
      appName: 'types_test',
      contractPath: 'artifacts/leo/types_test',
      networkMode: config.networkName === 'testnet' ? 1 : 0,
      fee: '0.01'
    });
  }
  async invert_bool(r0: boolean): Promise < [boolean, TransactionResponse & receipt.Types_testInvert_boolTransition] > {
    const r0Leo = js2leo.boolean(r0);

    const params = [r0Leo]
    const result = await this.ctx.execute('invert_bool', params);
    const out0 = leo2js.boolean(result.outputs[0] as string);
    return [out0, result];
  }

  async sum(r0: number, r1: number): Promise < [number, TransactionResponse & receipt.Types_testSumTransition] > {
    const r0Leo = js2leo.u32(r0);
    const r1Leo = js2leo.u32(r1);

    const params = [r0Leo, r1Leo]
    const result = await this.ctx.execute('sum', params);
    const out0 = leo2js.u32(result.outputs[0] as string);
    return [out0, result];
  }

  async mean_array(r0: Array < number > ): Promise < [number, TransactionResponse & receipt.Types_testMean_arrayTransition] > {
    const r0Leo = js2leo.arr2string(js2leo.array(r0, js2leo.u32));

    const params = [r0Leo]
    const result = await this.ctx.execute('mean_array', params);
    const out0 = leo2js.u32(result.outputs[0] as string);
    return [out0, result];
  }

  async print_address(r0: LeoAddress): Promise < [LeoAddress, LeoAddress, TransactionResponse & receipt.Types_testPrint_addressTransition] > {
    const r0Leo = js2leo.address(r0);

    const params = [r0Leo]
    const result = await this.ctx.execute('print_address', params);
    const out0 = leo2js.address(result.outputs[0] as string);
    const out1 = leo2js.address(result.outputs[1] as string);
    return [out0, out1, result];
  }

  async multiple_upto_5(r0: number): Promise < [Array < number > , TransactionResponse & receipt.Types_testMultiple_upto_5Transition] > {
    const r0Leo = js2leo.u32(r0);

    const params = [r0Leo]
    const result = await this.ctx.execute('multiple_upto_5', params);
    const out0 = leo2js.array(result.outputs[0], leo2js.u32);
    return [out0, result];
  }

  async check_message_signed(r0: bigint, r1: LeoAddress, r2: string): Promise < [string, boolean, TransactionResponse & receipt.Types_testCheck_message_signedTransition] > {
    const r0Leo = js2leo.field(r0);
    const r1Leo = js2leo.address(r1);
    const r2Leo = js2leo.signature(r2);

    const params = [r0Leo, r1Leo, r2Leo]
    const result = await this.ctx.execute('check_message_signed', params);
    const out0 = leo2js.signature(result.outputs[0] as string);
    const out1 = leo2js.boolean(result.outputs[1] as string);
    return [out0, out1, result];
  }

  async percentage(r0: Marks): Promise < [number, TransactionResponse & receipt.Types_testPercentageTransition] > {
    const r0Leo = js2leo.json(getMarksLeo(r0));

    const params = [r0Leo]
    const result = await this.ctx.execute('percentage', params);
    const out0 = leo2js.u32(result.outputs[0] as string);
    return [out0, result];
  }

  async report(r0: Report_Card): Promise < [Report, TransactionResponse & receipt.Types_testReportTransition] > {
    const r0Leo = js2leo.json(getReport_CardLeo(r0));

    const params = [r0Leo]
    const result = await this.ctx.execute('report', params);
    const out0 = getReport(result.outputs[0]);
    return [out0, result];
  }

  async increase_counter(r0: bigint): Promise < [LeoRecord, TransactionResponse & receipt.Types_testIncrease_counterTransition] > {
    const r0Leo = js2leo.u64(r0);

    const params = [r0Leo]
    const result = await this.ctx.execute('increase_counter', params);
    const out0 = (this.config.mode === ExecutionMode.LeoRun) ? JSON.stringify(result.outputs[0]) : result.outputs[0];
    return [out0, result];
  }

  async fund_us(r0: credits_credits, r1: bigint): Promise < [TransactionResponse & receipt.Types_testFund_usTransition] > {
    const r0Leo = js2leo.json(credits_getcreditsLeo(r0));
    const r1Leo = js2leo.u64(r1);

    const params = [r0Leo, r1Leo]
    const result = await this.ctx.execute('fund_us', params);
    return [result];
  }

  async get_balance(r0: LeoAddress): Promise < [TransactionResponse & receipt.Types_testGet_balanceTransition] > {
    const r0Leo = js2leo.address(r0);

    const params = [r0Leo]
    const result = await this.ctx.execute('get_balance', params);
    return [result];
  }

  async counter(key: boolean, defaultValue ? : bigint): Promise < bigint > {
    const keyLeo = js2leo.boolean(key);

    const params = [keyLeo]
    const result = await zkGetMapping(
      this.config,
      'counter',
      params[0],
    );

    if (result != null)
      return leo2js.u64(result);
    else {
      if (defaultValue != undefined) return defaultValue;
      throw new Error(`counter returned invalid value[input: ${key}, output: ${result}`);
    }
  }

  async fetched_balance(key: LeoAddress, defaultValue ? : bigint): Promise < bigint > {
    const keyLeo = js2leo.address(key);

    const params = [keyLeo]
    const result = await zkGetMapping(
      this.config,
      'fetched_balance',
      params[0],
    );

    if (result != null)
      return leo2js.u64(result);
    else {
      if (defaultValue != undefined) return defaultValue;
      throw new Error(`fetched_balance returned invalid value[input: ${key}, output: ${result}`);
    }
  }


}