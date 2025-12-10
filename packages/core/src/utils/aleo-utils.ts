import { DokoJSLogger } from '@doko-js/utils';

enum TokenType {
  UNKNOWN = 0,
  KEYWORD = 3,
  IDENTIFIER = 4
}

const DECLARATION_KEYWORDS = {
  STRUCT: 'struct',
  FUNCTION: 'function',
  FINALIZE: 'finalize',
  RECORD: 'record',
  CLOSURE: 'closure',
  MAPPING: 'mapping'
};

const KEYWORDS: Record<string, string> = {
  INPUT: 'input',
  OUTPUT: 'output',
  ADD: 'add',
  KEY: 'key',
  VALUE: 'value',
  LEFT: 'left',
  RIGHT: 'right',
  IMPORT: 'import',
  PROGRAM: 'program',
  ...DECLARATION_KEYWORDS
};

const KeyWordSet = new Set<string>(Object.values(KEYWORDS));

const CALL_OPERATOR = 'call';

interface TokenInfo {
  type: TokenType;
  // Only useful for data type for now
  value: string;
}

type Identifier = string;
type FunctionName = string;
type TypeName = string;
type DataType = string;
export type KeyVal<K, V> = { key: K; val: V };

interface StructDefinition {
  name: string;
  type: string;
  members: Array<KeyVal<Identifier, DataType>>;
}

interface FunctionDefinition {
  name: string;
  type: string;
  inputs: Array<KeyVal<Identifier, DataType>>;
  calls: Array<{ program: string; functionName: string }>;
  outputs: Array<DataType>;
}

interface MappingDefinition {
  name: string;
  key: DataType;
  value: DataType;
}

class ExternalRecord<P extends string, R extends string> {
  public readonly programName: P;
  public readonly recordName: R;

  constructor(type: `${P}.aleo/${R}`) {
    const parts = type.split('.aleo/');
    this.programName = parts[0] as P;
    this.recordName = parts[1] as R;
  }
}

const ALEO_TO_JS_TYPE_MAPPING = new Map([
  ['address', 'LeoAddress'],
  ['boolean', 'boolean'],
  ['field', 'bigint'],
  ['group', 'bigint'],
  ['i8', 'number'],
  ['i16', 'number'],
  ['i32', 'number'],
  ['i64', 'bigint'],
  ['i128', 'bigint'],
  ['u8', 'number'],
  ['u16', 'number'],
  ['u32', 'number'],
  ['u64', 'bigint'],
  ['u128', 'bigint'],
  ['scalar', 'bigint'],
  ['signature', 'string']
]);

const IsLeoPrimitiveType = (value: string) => {
  if (ALEO_TO_JS_TYPE_MAPPING.get(value)) return true;
  return false;
};

const IsLeoArray = (type: string) => {
  return type.match(/\[(.*?)\]/g) !== null;
};

const IsLeoExternalRecord = (type: string) => {
  return type.includes('.aleo/') && !type.includes('.future');
};

const GetLeoArrTypeAndSize = (arrDef: string) => {
  const arrComponents = arrDef.substring(1, arrDef.length - 1).split(' ');
  if (arrComponents.length !== 2)
    DokoJSLogger.error(`Invalid array definition: ${arrDef}`);
  return arrComponents;
};

/**
 * @param s The array depth string, e.g., "[[[CustomType 2u32] 2u32] 2u32]"
 * @returns A tuple of [baseType, depth]
 */
const GetLeoTypeAndDepth = (arrDef: string): [string, number] => {
  // 1. Regular Expression for single-pass extraction
  // Pattern:
  // ^      -> Start of the string
  // (\[*)  -> Group 1: Capture all leading '[' characters (this gives us the depth)
  // (\w+)  -> Group 2: Capture the word immediately following the brackets (this is the base type)
  const match = arrDef.match(/^(\[*)\s*(\w+)/);

  if (match && match.length >= 3) {
    const leadingBrackets = match[1]; // e.g., "[[["
    const baseType = match[2]; // e.g., "CustomType"

    // The length of the captured bracket string is the depth.
    const depth = leadingBrackets.length;

    return [baseType, depth];
  }

  // Fallback for malformed or empty strings
  return [arrDef, 0];
};

const ConvertToJSType = (
  type: string,
  isCustomType: boolean = false,
  depth: number = 0
) => {
  if (depth > 0) {
    const jsType = isCustomType ? type : ALEO_TO_JS_TYPE_MAPPING.get(type);
    return 'Array<'.repeat(depth) + jsType + '>'.repeat(depth);
  }
  if (IsLeoExternalRecord(type)) {
    const typeParts = type.split('.aleo/');
    const programName = typeParts[0];
    const recordName = typeParts[1];
    return `ExternalRecord<'${programName}', '${recordName}'>`;
  }
  return ALEO_TO_JS_TYPE_MAPPING.get(type);
};

function trimAleoPostfix(text: string) {
  if (text.endsWith('.aleo')) {
    return text.substring(0, text.length - '.aleo'.length);
  }
  return text;
}

function extractProgramName(aleoCode: string): string {
  const regex = /program\s+([\w.]+);/g;
  let match;

  if ((match = regex.exec(aleoCode)) !== null) {
    return match[1];
  }

  throw new Error('Aleo code malformed: program name not found');
}

export {
  TokenInfo,
  TokenType,
  Identifier,
  FunctionName,
  TypeName,
  DataType,
  StructDefinition,
  FunctionDefinition,
  MappingDefinition,
  KeyWordSet,
  ConvertToJSType,
  IsLeoArray,
  GetLeoArrTypeAndSize,
  GetLeoTypeAndDepth,
  IsLeoPrimitiveType,
  IsLeoExternalRecord,
  trimAleoPostfix,
  ExternalRecord,
  KEYWORDS,
  CALL_OPERATOR,
  extractProgramName
};
