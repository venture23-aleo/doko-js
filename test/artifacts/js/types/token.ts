import {
  z
} from "zod";
import {
  leoAddressSchema,
  leoPrivateKeySchema,
  leoViewKeySchema,
  leoTxIdSchema,
  leoScalarSchema,
  leoFieldSchema,
  leoBooleanSchema,
  leoU8Schema,
  leoU16Schema,
  leoU32Schema,
  leoU64Schema,
  leoU128Schema,
  leoGroupSchema,
  leoRecordSchema,
  leoTxSchema,
  leoSignatureSchema,
  LeoArray,
  LeoAddress,
  ExternalRecord,
  tx
} from "@doko-js/core";

export interface token {
  owner: LeoAddress;
  amount: bigint;
  _nonce: bigint;
}

export const leoTokenSchema = z.object({
  owner: leoAddressSchema,
  amount: leoU64Schema,
  _nonce: leoGroupSchema,
});
export type tokenLeo = z.infer < typeof leoTokenSchema > ;