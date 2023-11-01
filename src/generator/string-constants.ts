export const SCHEMA_IMPORT = `import { z } from "zod";
import { 
  leoU8Schema,
  leoU16Schema,
  leoU32Schema,
  leoU128Schema,
  leoFieldSchema,
  leoAddressSchema,
  leoBooleanSchema,
  leoGroupSchema,
  leoRecordSchema,
  leoScalarSchema
} from "./leo-types";`;

// Converter function for leo and ts
export const LEO_FN_IMPORT =
  'import { u8, u16, u32, u128, u64, i8, i16, i32, i64, i128, field, scalar, group, boolean, address } from "./common"';
export const TS_FN_IMPORT =
  'import { u8, u16, u32, u128, u64, i8, i16, i32, i64, i128, field, scalar, group, boolean, address } from "./common"';

export const STRING_JS: string = 'js';
export const STRING_LEO: string = 'leo';
