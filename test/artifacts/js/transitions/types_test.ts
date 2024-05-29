import {
  tx
} from "@doko-js/core";
import * as records from "../types/types_test";
import {
  CreditsTransfer_privateTransition
} from "./credits";

export type Types_testInvert_boolTransition = tx.ExecutionReceipt < [tx.Transition < [tx.PrivateOutput], 'types_test', 'invert_bool' > , ] >
  export type Types_testSumTransition = tx.ExecutionReceipt < [tx.Transition < [tx.PrivateOutput], 'types_test', 'sum' > , ] >
  export type Types_testMean_arrayTransition = tx.ExecutionReceipt < [tx.Transition < [tx.PrivateOutput], 'types_test', 'mean_array' > , ] >
  export type Types_testPrint_addressTransition = tx.ExecutionReceipt < [tx.Transition < [tx.PrivateOutput, tx.PrivateOutput], 'types_test', 'print_address' > , ] >
  export type Types_testMultiple_upto_5Transition = tx.ExecutionReceipt < [tx.Transition < [tx.PrivateOutput], 'types_test', 'multiple_upto_5' > , ] >
  export type Types_testCheck_message_signedTransition = tx.ExecutionReceipt < [tx.Transition < [tx.PrivateOutput, tx.PrivateOutput], 'types_test', 'check_message_signed' > , ] >
  export type Types_testPercentageTransition = tx.ExecutionReceipt < [tx.Transition < [tx.PrivateOutput], 'types_test', 'percentage' > , ] >
  export type Types_testReportTransition = tx.ExecutionReceipt < [tx.Transition < [tx.PrivateOutput], 'types_test', 'report' > , ] >
  export type Types_testIncrease_counterTransition = tx.ExecutionReceipt < [tx.Transition < [tx.RecordOutput < records.Counts > , tx.FutureOutput], 'types_test', 'increase_counter' > , ] >
  export type Types_testFund_usTransition = tx.ExecutionReceipt < [...CreditsTransfer_privateTransition['execution']['transitions'],
    tx.Transition < [], 'types_test', 'fund_us' > ,
  ] >
  export type Types_testGet_balanceTransition = tx.ExecutionReceipt < [tx.Transition < [tx.FutureOutput], 'types_test', 'get_balance' > , ] >