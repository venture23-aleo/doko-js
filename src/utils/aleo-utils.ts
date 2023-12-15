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
  outputs: Array<DataType>;
}

interface MappingDefinition {
  name: string;
  key: DataType;
  value: DataType;
}

const ALEO_TO_JS_TYPE_MAPPING = new Map([
  ['address', 'string'],
  ['boolean', 'boolean'],
  ['field', 'BigInt'],
  ['group', 'BigInt'],
  ['i8', 'number'],
  ['i16', 'number'],
  ['i32', 'number'],
  ['i64', 'BigInt'],
  ['i128', 'BigInt'],
  ['u8', 'number'],
  ['u16', 'number'],
  ['u32', 'number'],
  ['u64', 'BigInt'],
  ['u128', 'BigInt'],
  ['scalar', 'BigInt'],
  ['signature', 'string']
]);

const IsLeoPrimitiveType = (value: string) => {
  if (ALEO_TO_JS_TYPE_MAPPING.get(value)) return true;
  return false;
};

const IsLeoArray = (type: string) => {
  return type.match(/\[(.*?)\]/g) !== null;
};

const GetLeoArrTypeAndSize = (arrDef: string) => {
  const arrComponents = arrDef.substring(1, arrDef.length - 1).split(' ');
  if (arrComponents.length !== 2)
    console.error('Invalid array definition: ', arrDef);
  return arrComponents;
};

const ConvertToJSType = (type: string) => {
  if (IsLeoArray(type)) {
    const [arrType, arrSize] = GetLeoArrTypeAndSize(type);
    const jsType = ALEO_TO_JS_TYPE_MAPPING.get(arrType);
    return `Array<${jsType}>`;
  }
  return ALEO_TO_JS_TYPE_MAPPING.get(type);
};

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
  KEYWORDS
};
