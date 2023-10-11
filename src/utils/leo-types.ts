import { z } from "zod";

// Leo Type Schema
const leoStringSchema = (appendedValue: string) =>
    z
        .string()
        .endsWith(appendedValue)
        .or(z.string().endsWith(`${appendedValue}.private`))
        .or(z.string().endsWith(`${appendedValue}.public`));

export const leoAddressSchema = z
    .string()
    .startsWith("aleo1")
    .length(63)
    .or(z.string().startsWith("aleo1").endsWith(".private").length(71))
    .or(z.string().startsWith("aleo1").endsWith(".public").length(70));

export type LeoAddress = z.infer<typeof leoAddressSchema>;

export const leoPrivateKeySchema = z.string().startsWith("APrivateKey1").length(59);
export type LeoPrivateKey = z.infer<typeof leoPrivateKeySchema>;

export const leoViewKeySchema = z.string().startsWith("AViewKey1").length(53);
export type LeoViewKey = z.infer<typeof leoViewKeySchema>;

export const leoTxIdSchema = z.string().startsWith("at1");
export type LeoTxId = z.infer<typeof leoTxIdSchema>;

export const leoU128Schema = leoStringSchema("u128");
export type LeoU128 = z.infer<typeof leoFieldSchema>;

export const leoScalarSchema = leoStringSchema("scalar");
export type LeoScalar = z.infer<typeof leoScalarSchema>;

export const leoFieldSchema = leoStringSchema("field");
export type LeoField = z.infer<typeof leoFieldSchema>;

export const leoBooleanSchema = leoStringSchema("");
export type LeoBoolean = z.infer<typeof leoBooleanSchema>;

export const leoU8Schema = leoStringSchema("u8");
export type LeoU8 = z.infer<typeof leoU8Schema>;

export const leoU16Schema = leoStringSchema("u16");
export type LeoU16 = z.infer<typeof leoU16Schema>;

export const leoU32Schema = leoStringSchema("u32");
export type LeoU32 = z.infer<typeof leoU32Schema>;

export const leoU64Schema = leoStringSchema("u64");
export type LeoU64 = z.infer<typeof leoU64Schema>;

export const leoGroupSchema = leoStringSchema("group");
export type LeoGroup = z.infer<typeof leoGroupSchema>;

export const leoRecordSchema = z.string().startsWith("record1");
export type LeoRecord = z.infer<typeof leoRecordSchema>;

export const leoTxSchema = z.object({
    execution: z.object({
        transitions: z.array(
            z.object({
                outputs: z.array(
                    z.object({
                        value: z.string(),
                    })
                ),
            })
        ),
    }),
});
export type LeoTx = z.infer<typeof leoTxSchema>;

// Leo Type Converter

export const field = (value: BigInt): LeoField => {
    const parsed = value + "field";
    return leoFieldSchema.parse(parsed);
};

export const scalar = (value: BigInt): LeoScalar => {
    const parsed = value + "scalar";
    return leoScalarSchema.parse(parsed);
};

export const group = (value: BigInt): LeoGroup => {
    const parsed = value + "group";
    return leoGroupSchema.parse(parsed);
};

export const u8 = (value: number): LeoU8 => {
    if (isNaN(value)) throw new Error("u8 parsing failed");
    const parsed = value + "u8";
    return leoU8Schema.parse(parsed);
};

export const u16 = (value: number): LeoU16 => {
    if (isNaN(value)) throw new Error("u16 parsing failed");
    const parsed = value + "u16";
    return leoU16Schema.parse(parsed);
};

export const u32 = (value: number): LeoU32 => {
    if (isNaN(value)) throw new Error("u32 parsing failed");
    const parsed = value + "u32";
    return leoU32Schema.parse(parsed);
};

export const u64 = (value: number): LeoU64 => {
    if (isNaN(value)) throw new Error("u64 parsing failed");
    const parsed = value + "u64";
    return leoU64Schema.parse(parsed);
};

export const u128 = (value: BigInt): LeoU128 => {
    if (!value) throw new Error("u128 parsing failed");
    const parsed = value + "u128";
    return leoU128Schema.parse(parsed);
};

export const boolean = (value: boolean): LeoU128 => {
    const val = value ? "true" : "false";
    return leoBooleanSchema.parse(val);
};

export const address = (value: string): LeoAddress => {
    return value;
}