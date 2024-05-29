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

export interface credits {
  owner: LeoAddress;
  microcredits: bigint;
  _nonce: bigint;
}

export const leoCreditsSchema = z.object({
  owner: leoAddressSchema,
  microcredits: leoU64Schema,
  _nonce: leoGroupSchema,
});
export type creditsLeo = z.infer < typeof leoCreditsSchema > ;