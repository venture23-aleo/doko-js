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

const ConvertToJSType = (type: string) => {
  if (IsLeoArray(type)) {
    const [arrType, arrSize] = GetLeoArrTypeAndSize(type);
    const jsType = ALEO_TO_JS_TYPE_MAPPING.get(arrType);
    return `Array<${jsType}>`;
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
  IsLeoPrimitiveType,
  IsLeoExternalRecord,
  trimAleoPostfix,
  ExternalRecord,
  KEYWORDS,
  CALL_OPERATOR
};
