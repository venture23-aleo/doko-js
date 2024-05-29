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

export interface Marks {
  english: number;
  math: number;
  nepali: number;
}

export const leoMarksSchema = z.object({
  english: leoU32Schema,
  math: leoU32Schema,
  nepali: leoU32Schema,
});
export type MarksLeo = z.infer < typeof leoMarksSchema > ;

export interface Report_Card {
  attendance: number;
  mark: Marks;
}

export const leoReport_CardSchema = z.object({
  attendance: leoU32Schema,
  mark: leoMarksSchema,
});
export type Report_CardLeo = z.infer < typeof leoReport_CardSchema > ;

export interface Report {
  percentage: number;
  pass: boolean;
}

export const leoReportSchema = z.object({
  percentage: leoU32Schema,
  pass: leoBooleanSchema,
});
export type ReportLeo = z.infer < typeof leoReportSchema > ;

export interface Counts {
  owner: LeoAddress;
  increased_by: bigint;
  _nonce: bigint;
}

export const leoCountsSchema = z.object({
  owner: leoAddressSchema,
  increased_by: leoU64Schema,
  _nonce: leoGroupSchema,
});
export type CountsLeo = z.infer < typeof leoCountsSchema > ;