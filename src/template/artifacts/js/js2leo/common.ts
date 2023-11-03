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
  LeoTx
} from '../types/leo-types';

// Leo Type Converter
export const field = (value: BigInt): LeoField => {
  const parsed = value + 'field';
  return leoFieldSchema.parse(parsed);
};

export const scalar = (value: BigInt): LeoScalar => {
  const parsed = value + 'scalar';
  return leoScalarSchema.parse(parsed);
};

export const group = (value: BigInt): LeoGroup => {
  const parsed = value + 'group';
  return leoGroupSchema.parse(parsed);
};

export const u8 = (value: number): LeoU8 => {
  if (isNaN(value)) throw new Error('u8 parsing failed');
  if (value < 0 || value > (1 << 8) - 1)
    throw new Error('Exceed max uint8 value: ' + value);
  const parsed = value + 'u8';
  return leoU8Schema.parse(parsed);
};

export const u16 = (value: number): LeoU16 => {
  if (isNaN(value)) throw new Error('u16 parsing failed');
  if (value < 0 || value > (1 << 16) - 1)
    throw new Error('Exceed max uint16 value: ' + value);
  const parsed = value + 'u16';
  return leoU16Schema.parse(parsed);
};

const U32_MAX = 4294967295;
export const u32 = (value: number): LeoU32 => {
  if (isNaN(value)) throw new Error('u32 parsing failed');
  if (value < 0 || value > U32_MAX)
    throw new Error('Exceed max uint32 value: ' + value);
  const parsed = value + 'u32';
  return leoU32Schema.parse(parsed);
};

export const u64 = (value: BigInt): LeoU64 => {
  const parsed = value + 'u64';
  return leoU64Schema.parse(parsed);
};

export const u128 = (value: BigInt): LeoU128 => {
  if (!value) throw new Error('u128 parsing failed');
  const parsed = value + 'u128';
  return leoU128Schema.parse(parsed);
};

export const i8 = (value: number): LeoU8 => {
  if (isNaN(value)) throw new Error('u8 parsing failed');
  const parsed = value + 'i8';
  return leoU8Schema.parse(parsed);
};

export const i16 = (value: number): LeoU16 => {
  if (isNaN(value)) throw new Error('u16 parsing failed');
  const parsed = value + 'i16';
  return leoU16Schema.parse(parsed);
};

export const i32 = (value: number): LeoU32 => {
  if (isNaN(value)) throw new Error('u32 parsing failed');
  const parsed = value + 'i32';
  return leoU32Schema.parse(parsed);
};

export const i64 = (value: BigInt): LeoU64 => {
  const parsed = value + 'i64';
  return leoU64Schema.parse(parsed);
};

export const i128 = (value: BigInt): LeoU128 => {
  if (!value) throw new Error('u128 parsing failed');
  const parsed = value + 'i128';
  return leoU128Schema.parse(parsed);
};

export const boolean = (value: boolean): LeoU128 => {
  const val = value ? 'true' : 'false';
  return leoBooleanSchema.parse(val);
};

export const address = (value: string): LeoAddress => {
  return value;
};
