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
  LeoArray,
  LeoAddress,
  ExternalRecord,
  tx
} from "@doko-js/core";`;

// Converter function for leo and ts
export const LEO_FN_IMPORT = 'import {js2leo} from "@doko-js/core";\n';
export const JS_FN_IMPORT =
  'import {leo2js, tx, parseJSONLikeString} from "@doko-js/core";\nimport {PrivateKey} from "@aleohq/sdk"\n';

export const STRING_JS: string = 'js';
export const STRING_LEO: string = 'leo';

export const GENERATE_FILE_OUT_DIR = 'artifacts/js/';
export const PROGRAM_DIRECTORY = 'artifacts/leo/';
export const IMPORTS_PATH = 'imports/';
