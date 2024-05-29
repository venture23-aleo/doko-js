import {
  tx
} from "@doko-js/core";
import * as records from "../types/token";


export type TokenMint_publicTransition = tx.ExecutionReceipt < [tx.Transition < [tx.FutureOutput], 'token', 'mint_public' > , ] >
  export type TokenMint_privateTransition = tx.ExecutionReceipt < [tx.Transition < [tx.RecordOutput < records.token > ], 'token', 'mint_private' > , ] >
  export type TokenTransfer_publicTransition = tx.ExecutionReceipt < [tx.Transition < [tx.FutureOutput], 'token', 'transfer_public' > , ] >
  export type TokenTransfer_privateTransition = tx.ExecutionReceipt < [tx.Transition < [tx.RecordOutput < records.token > , tx.RecordOutput < records.token > ], 'token', 'transfer_private' > , ] >
  export type TokenTransfer_private_to_publicTransition = tx.ExecutionReceipt < [tx.Transition < [tx.RecordOutput < records.token > , tx.FutureOutput], 'token', 'transfer_private_to_public' > , ] >
  export type TokenTransfer_public_to_privateTransition = tx.ExecutionReceipt < [tx.Transition < [tx.RecordOutput < records.token > , tx.FutureOutput], 'token', 'transfer_public_to_private' > , ] >