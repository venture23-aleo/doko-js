export const SCHEMA_IMPORT = `import { z } from "zod";
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
  LeoArray
} from "./leo-types";`;

// Converter function for leo and ts
export const LEO_FN_IMPORT = 'import * as js2leo from "./common";\n';
export const JS_FN_IMPORT = 'import * as leo2js from "./common";\n';

export const STRING_JS: string = 'js';
export const STRING_LEO: string = 'leo';

export const GENERATE_FILE_OUT_DIR = 'artifacts/js/';
export const PROGRAM_DIRECTORY = 'artifacts/leo/';
