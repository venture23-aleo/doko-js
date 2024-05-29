import {
  tx
} from "@doko-js/core";
import * as records from "../types/credits";


export type CreditsMintTransition = tx.ExecutionReceipt < [tx.Transition < [tx.RecordOutput < records.credits > ], 'credits', 'mint' > , ] >
  export type CreditsTransfer_privateTransition = tx.ExecutionReceipt < [tx.Transition < [tx.RecordOutput < records.credits > , tx.RecordOutput < records.credits > ], 'credits', 'transfer_private' > , ] >
  export type CreditsJoinTransition = tx.ExecutionReceipt < [tx.Transition < [tx.RecordOutput < records.credits > ], 'credits', 'join' > , ] >
  export type CreditsSplitTransition = tx.ExecutionReceipt < [tx.Transition < [tx.RecordOutput < records.credits > , tx.RecordOutput < records.credits > ], 'credits', 'split' > , ] >
  export type CreditsFeeTransition = tx.ExecutionReceipt < [tx.Transition < [tx.RecordOutput < records.credits > ], 'credits', 'fee' > , ] >