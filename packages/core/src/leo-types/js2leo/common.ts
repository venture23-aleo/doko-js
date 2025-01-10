import { DokoJSError, DokoJSLogger, ERRORS } from '@doko-js/utils';

import {
  leoAddressSchema,
  LeoAddress,
  leoPrivateKeySchema,
  LeoPrivateKey,
  leoViewKeySchema,
  LeoViewKey,
  leoTxIdSchema,
  LeoTxId,
  leoScalarSchema,
  LeoScalar,
  LeoField,
  leoFieldSchema,
  leoBooleanSchema,
  LeoBoolean,
  leoU8Schema,
  LeoU8,
  leoU16Schema,
  LeoU16,
  leoU32Schema,
  LeoU32,
  leoU64Schema,
  LeoU64,
  leoU128Schema,
  LeoU128,
  leoGroupSchema,
  LeoGroup,
  leoRecordSchema,
  LeoRecord,
  leoTxSchema,
  LeoTx,
  LeoSignature,
  leoSignatureSchema,
  leoI8Schema,
  leoI128Schema,
  leoI16Schema,
  leoI32Schema,
  leoI64Schema
} from '../types/leo-types';

// Leo Type Converter
export const field = (value: bigint): LeoField => {
  const parsed = value + 'field';
  return leoFieldSchema.parse(parsed);
};

export const scalar = (value: bigint): LeoScalar => {
  const parsed = value + 'scalar';
  return leoScalarSchema.parse(parsed);
};

export const group = (value: bigint): LeoGroup => {
  const parsed = value + 'group';
  return leoGroupSchema.parse(parsed);
};

export const u8 = (value: number): LeoU8 => {
  if (isNaN(value))
    throw new DokoJSError(ERRORS.INTERNAL.TYPE_PARSING_FAILED, {
      type: 'u8'
    });
  if (value < 0 || value > (1 << 8) - 1)
    throw new DokoJSError(ERRORS.INTERNAL.EXCEEDED_INT_VALUE, {
      type: 'uint8',
      value
    });
  const parsed = value + 'u8';
  return leoU8Schema.parse(parsed);
};

export const u16 = (value: number): LeoU16 => {
  if (isNaN(value))
    throw new DokoJSError(ERRORS.INTERNAL.TYPE_PARSING_FAILED, {
      type: 'u16'
    });
  if (value < 0 || value > (1 << 16) - 1)
    throw new DokoJSError(ERRORS.INTERNAL.EXCEEDED_INT_VALUE, {
      type: 'uint16',
      value
    });
  const parsed = value + 'u16';
  return leoU16Schema.parse(parsed);
};

const U32_MAX = 4294967295;
export const u32 = (value: number): LeoU32 => {
  if (isNaN(value))
    throw new DokoJSError(ERRORS.INTERNAL.TYPE_PARSING_FAILED, {
      type: 'u32'
    });
  if (value < 0 || value > U32_MAX)
    throw new DokoJSError(ERRORS.INTERNAL.EXCEEDED_INT_VALUE, {
      type: 'uint32',
      value
    });

  const parsed = value + 'u32';
  return leoU32Schema.parse(parsed);
};

export const u64 = (value: bigint): LeoU64 => {
  const parsed = value + 'u64';
  return leoU64Schema.parse(parsed);
};

export const u128 = (value: bigint): LeoU128 => {
  const parsed = value + 'u128';
  return leoU128Schema.parse(parsed);
};

export const i8 = (value: number): LeoU8 => {
  if (isNaN(value)) DokoJSLogger.warn('u8 parsing failed');
  const parsed = value + 'i8';
  return leoI8Schema.parse(parsed);
};

export const i16 = (value: number): LeoU16 => {
  if (isNaN(value))
    throw new DokoJSError(ERRORS.INTERNAL.TYPE_PARSING_FAILED, {
      type: 'u16'
    });
  const parsed = value + 'i16';
  return leoI16Schema.parse(parsed);
};

export const i32 = (value: number): LeoU32 => {
  if (isNaN(value))
    throw new DokoJSError(ERRORS.INTERNAL.TYPE_PARSING_FAILED, {
      type: 'u32'
    });
  const parsed = value + 'i32';
  return leoI32Schema.parse(parsed);
};

export const i64 = (value: bigint): LeoU64 => {
  const parsed = value + 'i64';
  return leoI64Schema.parse(parsed);
};

export const i128 = (value: bigint): LeoU128 => {
  const parsed = value + 'i128';
  return leoI128Schema.parse(parsed);
};

export const boolean = (value: boolean): LeoU128 => {
  const val = value ? 'true' : 'false';
  return leoBooleanSchema.parse(val);
};

export const address = (value: string): LeoAddress => {
  return leoAddressSchema.parse(value);
};

export const signature = (value: string): LeoSignature => {
  return leoSignatureSchema.parse(value);
};

export const privateField = (value: string): string => {
  return value.concat('.private');
};

export const publicField = (value: string): string => {
  return value.concat('.public');
};

export const json = (value: any): string => {
  return JSON.stringify(value).replace(/"/g, '');
};

// eslint-disable-next-line @typescript-eslint/ban-types
export const array = (value: Array<any>, converterFn: Function): any[] => {
  return value.map((v) => converterFn(v));
};

export const arr2string = (arr: Array<string>) => {
  return `[${arr.join(',')}]`;
};
