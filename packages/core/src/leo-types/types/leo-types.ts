import { ZodAny, ZodType, ZodTypeAny, z } from 'zod';

// Leo Type Schema
const leoStringSchema = (appendedValue: string) =>
  z
    .string()
    .endsWith(appendedValue)
    .or(z.string().endsWith(`${appendedValue}.private`))
    .or(z.string().endsWith(`${appendedValue}.public`));

export const leoAddressSchema = z
  .string()
  .startsWith('aleo1')
  .length(63)
  .or(z.string().startsWith('aleo1').endsWith('.private').length(71))
  .or(z.string().startsWith('aleo1').endsWith('.public').length(70));

export type LeoAddress = z.infer<typeof leoAddressSchema>;

export const leoPrivateKeySchema = z
  .string()
  .startsWith('APrivateKey1')
  .length(59);
export type LeoPrivateKey = z.infer<typeof leoPrivateKeySchema>;

export const leoViewKeySchema = z.string().startsWith('AViewKey1').length(53);
export type LeoViewKey = z.infer<typeof leoViewKeySchema>;

export const leoTxIdSchema = z.string().startsWith('at1');
export type LeoTxId = z.infer<typeof leoTxIdSchema>;

export const leoScalarSchema = leoStringSchema('scalar');
export type LeoScalar = z.infer<typeof leoScalarSchema>;

export const leoFieldSchema = leoStringSchema('field');
export type LeoField = z.infer<typeof leoFieldSchema>;

export const leoBooleanSchema = leoStringSchema('');
export type LeoBoolean = z.infer<typeof leoBooleanSchema>;

export const leoU8Schema = leoStringSchema('u8');
export type LeoU8 = z.infer<typeof leoU8Schema>;

export const leoU16Schema = leoStringSchema('u16');
export type LeoU16 = z.infer<typeof leoU16Schema>;

export const leoU32Schema = leoStringSchema('u32');
export type LeoU32 = z.infer<typeof leoU32Schema>;

export const leoU64Schema = leoStringSchema('u64');
export type LeoU64 = z.infer<typeof leoU64Schema>;

export const leoU128Schema = leoStringSchema('u128');
export type LeoU128 = z.infer<typeof leoU128Schema>;

export const leoI8Schema = leoStringSchema('i8');
export type LeoI8 = z.infer<typeof leoI8Schema>;

export const leoI16Schema = leoStringSchema('i16');
export type LeoI16 = z.infer<typeof leoI16Schema>;

export const leoI32Schema = leoStringSchema('i32');
export type LeoI32 = z.infer<typeof leoI32Schema>;

export const leoI64Schema = leoStringSchema('i64');
export type LeoI64 = z.infer<typeof leoI64Schema>;

export const leoI128Schema = leoStringSchema('i128');
export type LeoI128 = z.infer<typeof leoI128Schema>;

export const leoGroupSchema = leoStringSchema('group');
export type LeoGroup = z.infer<typeof leoGroupSchema>;

export const leoRecordSchema = z.string().startsWith('record1');
export type LeoRecord = z.infer<typeof leoRecordSchema>;

export const leoSignatureSchema = z
  .string()
  .startsWith('sign1')
  .or(z.string().startsWith('sign1').endsWith('.private'))
  .or(z.string().startsWith('sign1').endsWith('.public'));

export type LeoSignature = z.infer<typeof leoSignatureSchema>;

export const leoTxSchema = z.object({
  execution: z.object({
    transitions: z.array(
      z.object({
        outputs: z.array(
          z.object({
            value: z.string()
          })
        )
      })
    )
  })
});
export type LeoTx = z.infer<typeof leoTxSchema>;

export type LeoArray<
  Type,
  Length extends number,
  V extends Type[] = []
> = V['length'] extends Length ? Type : LeoArray<Type, Length, [...V, Type]>;
